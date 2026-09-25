"""Independent ZIP reader: CRC, byte identity, safe paths and PDF inventory."""
from pathlib import Path
from zipfile import ZipFile
from io import BytesIO
import json
from pypdf import PdfReader

root=Path('test-output')
for engine in ['chromium','webkit']:
    for prefix in ['delivery','orphan-delivery']:
        with ZipFile(root/f'{prefix}-{engine}.zip') as z:
            assert z.testzip() is None
            names=z.namelist()
            assert len(names)==len(set(names))==10
            assert all(not p.startswith('/') and '..' not in p.split('/') for p in names)
            manifest=json.loads(z.read('files.json'))['files']
            assert len(manifest)==7
            lidar=[x for x in manifest if x['originalName']=='escáner.e57']
            assert len(lidar)==2 and len({x['path'] for x in lidar})==2
            assert z.read(lidar[0]['path'])==(root/f'lidar-original-{engine}.e57').read_bytes()
            assert z.read(lidar[1]['path'])==b'duplicate'
            assert sum(x['group']=='attachments' for x in manifest)==6
            assert all(z.getinfo(x['path']).file_size==x['size'] for x in manifest)
            assert len({str(Path(x['path']).parent) for x in manifest if x['group']=='attachments'})==2
            pdf=z.read(next(x for x in names if x.endswith('.pdf')))
            reader=PdfReader(BytesIO(pdf))
            text='\n'.join(p.extract_text() for p in reader.pages)
            assert text.count('Archivos del setup y LiDAR')==2
            assert 'modelo.obj' in text and 'modelo.mtl' in text and 'scan.ply' in text
            assert 'SH001' in text and 'SH003' in text
            if prefix=='delivery': assert 'SH002' in text
            else: assert 'SH002' not in text
            assert any(len(p.images)>1 for p in reader.pages) # brand + reference photo
            (root/f'{prefix}-{engine}.pdf').write_bytes(pdf)
            print(f'PASS {prefix}-{engine}: {len(names)} entries, valid CRCs, unchanged originals, {len(reader.pages)} PDF pages, setup assets appear once')
