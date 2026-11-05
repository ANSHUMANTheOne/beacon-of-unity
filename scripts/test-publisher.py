import unittest,tempfile,sys,subprocess,json
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from build import build
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
if __name__=='__main__':unittest.main()
