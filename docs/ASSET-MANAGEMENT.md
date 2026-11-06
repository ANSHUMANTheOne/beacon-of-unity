# Asset management

Keep project-specific resources beside their project. Keep branding in `assets/branding/`. The Code-page interactive resources are stored together under `website/interactive-assets/code/` and are not featured in README navigation.

Every existing resource is copied without compression, conversion, renaming of public paths, or redirects. Video filenames with extra letters remain distinct manifest entries. The two 2-byte MP4 placeholders have identical hashes to `nothing`; they are not playable video and are retained. The real `voltwayvideo.mp4` is a different 23,527,562-byte resource and remains at the root for its raw GitHub consumer. `eysc.zip` contains an empty `eysc/` directory; it is preserved, not silently repaired.

New resources need explicit manifest entries before publishing. Never repurpose an old public URL for different content without reviewing its consumers. Case matters on deployment hosts.

Public repository contents, Git history and deployed media remain accessible. Folder placement reduces casual visibility but does not provide confidentiality. Obfuscation does not protect browser-delivered assets. Encryption with a user-held key would require a separately approved access-flow change and would not remove existing public copies.

`/og-image.png` is an additional output alias for `assets/branding/logo.png`, repairing an existing metadata reference that returned 404. It uses the same original PNG bytes as `/logo.png`; no extra source image, resizing or encoding is introduced.
