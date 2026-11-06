import unittest,tempfile,sys,subprocess,json,shutil
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from build import build, expected_content
from validate import validate
class PublisherContract(unittest.TestCase):
 def setUp(self):
  self.tmp=tempfile.TemporaryDirectory();self.base=Path(self.tmp.name);self.root=self.base/'source';self.root.mkdir();self.out=self.base/'public';self.manifest=self.base/'routes.json'
  subprocess.run(['git','init','-q',str(self.root)],check=True)
 def tearDown(self):self.tmp.cleanup()
 def config(self,rows,patterns=None):self.manifest.write_text(json.dumps(dict(baseline="fixture",files=rows,passthrough_patterns=patterns or [])))
 def track(self,path,data):
  p=self.root/path;p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(data);subprocess.run(['git','-C',str(self.root),'add','--',path],check=True)
 def test_relocated_binary_preserves_original_route_and_excludes_unlisted_files(self):
  self.track('assets/resource.gif',b'GIF89a\x00\xff');self.track('private.txt',b'excluded')
  self.config([dict(source='assets/resource.gif',original='resource.gif')]);build(self.root,self.out,self.manifest)
  self.assertEqual((self.out/'resource.gif').read_bytes(),b'GIF89a\x00\xff');self.assertFalse((self.out/'private.txt').exists());self.assertTrue(validate(self.root,self.out,self.manifest)['passed'])
 def test_new_tracked_social_files_keep_their_paths(self):
  self.track('social/index.html',b'<h1>Concurrent</h1>');self.track('socialdemo.js',b'export const x=1;');self.config([],['social/*','socialdemo.*']);build(self.root,self.out,self.manifest)
  self.assertEqual((self.out/'social/index.html').read_bytes(),b'<h1>Concurrent</h1>');self.assertTrue((self.out/'socialdemo.js').is_file());self.assertTrue(validate(self.root,self.out,self.manifest)['passed'])
 def test_sensitive_passthrough_is_rejected(self):
  self.track('social/.env',b'NOT_A_REAL_SECRET=fixture');self.config([],['social/*'])
  with self.assertRaises(ValueError):build(self.root,self.out,self.manifest)
 def test_path_escape_and_case_collisions_are_rejected(self):
  self.track('resource',b'x');self.config([dict(source='resource',original='../outside')])
  with self.assertRaises(ValueError):build(self.root,self.out,self.manifest)
  self.config([dict(source='resource',original='File'),dict(source='resource',original='file')])
  with self.assertRaises(ValueError):build(self.root,self.out,self.manifest)
 def test_refuses_to_overwrite_existing_build(self):
  self.out.mkdir();self.config([])
  with self.assertRaises(ValueError):build(self.root,self.out,self.manifest)
 def test_cloudflare_entrypoint_rejects_stale_or_extra_output(self):
  self.track('assets/resource.gif',b'GIF89a-original')
  self.config([dict(source='assets/resource.gif',original='resource.gif')])
  scripts=self.root/'scripts';scripts.mkdir()
  for name in ['build.py','validate.py','cloudflare-build.mjs']:
   shutil.copyfile(Path(__file__).resolve().parent/name,scripts/name)
  (self.root/'config').mkdir()
  shutil.copyfile(self.manifest,self.root/'config/routes.json')
  command=['node',str(scripts/'cloudflare-build.mjs')]
  result=subprocess.run(command,cwd=self.base,capture_output=True,text=True)
  self.assertEqual(result.returncode,0,result.stderr)
  published=self.root/'dist/resource.gif'
  self.assertEqual(published.read_bytes(),b'GIF89a-original')
  result=subprocess.run(command,cwd=self.base,capture_output=True,text=True)
  self.assertEqual(result.returncode,0,result.stderr)
  (self.root/'assets/resource.gif').write_bytes(b'GIF89a-changed')
  result=subprocess.run(command,cwd=self.base,capture_output=True,text=True)
  self.assertNotEqual(result.returncode,0)
  self.assertEqual(published.read_bytes(),b'GIF89a-original')
  (self.root/'assets/resource.gif').write_bytes(b'GIF89a-original')
  extra=self.root/'dist/.env';extra.write_text('FIXTURE_ONLY=true')
  result=subprocess.run(command,cwd=self.base,capture_output=True,text=True)
  self.assertNotEqual(result.returncode,0)
  self.assertTrue(extra.exists())
 def test_text_repairs_cannot_override_media_integrity(self):
  row=dict(original='page.html',bytes=10,sha256='b'*64,source_bytes=12,source_sha256='a'*64,source_change='Repair invalid syntax without changing displayed text')
  self.assertEqual(expected_content(row),(12,'a'*64))
  self.assertEqual(row['sha256'],'b'*64)
  with self.assertRaises(ValueError):expected_content(dict(row,original='clip.mp4'))
  with self.assertRaises(ValueError):expected_content(dict(row,source_change=''))
 def test_public_alias_preserves_canonical_binary_bytes(self):
  self.track('assets/resource.gif',b'GIF89a\x00\xff')
  self.config([dict(source='assets/resource.gif',original='resource.gif')])
  data=json.loads(self.manifest.read_text());data['aliases']=[dict(source='assets/resource.gif',original='legacy/resource.gif')];self.manifest.write_text(json.dumps(data))
  build(self.root,self.out,self.manifest)
  self.assertEqual((self.out/'resource.gif').read_bytes(),(self.out/'legacy/resource.gif').read_bytes())
  self.assertTrue(validate(self.root,self.out,self.manifest)['passed'])
 def test_current_main_design_assets_require_explicit_mapping(self):
  self.track('assets/platform.css',b'body{color:black}')
  self.track('src/not-public.js',b'export const sourceOnly=true')
  self.config([])
  data=json.loads(self.manifest.read_text());data['additions']=[dict(source='assets/platform.css',original='assets/platform.css')];self.manifest.write_text(json.dumps(data))
  build(self.root,self.out,self.manifest)
  self.assertEqual((self.out/'assets/platform.css').read_bytes(),b'body{color:black}')
  self.assertFalse((self.out/'src/not-public.js').exists());self.assertTrue(validate(self.root,self.out,self.manifest)['passed'])
 def test_new_public_files_cannot_be_silently_omitted(self):
  self.track('new.html',b'<h1>New project</h1>');self.track('docs/note.md',b'Source-only notes');self.config([])
  data=json.loads(self.manifest.read_text());data.update(require_explicit_sources=True,source_only_prefixes=['docs/']);self.manifest.write_text(json.dumps(data))
  with self.assertRaisesRegex(ValueError,'Unmapped tracked sources'):build(self.root,self.out,self.manifest)
  self.assertFalse(self.out.exists())
  data['files']=[dict(source='new.html',original='new.html')];self.manifest.write_text(json.dumps(data));build(self.root,self.out,self.manifest)
  self.assertEqual((self.out/'new.html').read_bytes(),b'<h1>New project</h1>');self.assertFalse((self.out/'docs/note.md').exists());self.assertTrue(validate(self.root,self.out,self.manifest)['passed'])
if __name__=='__main__':unittest.main()
