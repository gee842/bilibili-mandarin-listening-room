import importlib.util,pathlib,sys,tempfile,unittest
from unittest.mock import patch

spec=importlib.util.spec_from_file_location('pipeline_installer',pathlib.Path(__file__).resolve().parents[1]/'install.py')
installer=importlib.util.module_from_spec(spec);spec.loader.exec_module(installer)

class InstallerTests(unittest.TestCase):
    def test_missing_downloader_explains_setup_without_writing_credentials(self):
        with tempfile.TemporaryDirectory()as directory:
            app=pathlib.Path(directory)/'app'
            with patch.object(sys,'argv',['install.py','--python',str(pathlib.Path(directory)/'python'),'--app-dir',str(app),'--noninteractive']),patch.object(installer.subprocess,'run'),patch.object(installer.shutil,'which',side_effect=lambda name:'/usr/bin/ffmpeg'if name=='ffmpeg'else None):
                with self.assertRaisesRegex(SystemExit,'yt-dlp is required'):installer.main()
            self.assertFalse((app/'.env').exists())

if __name__=='__main__':unittest.main()
