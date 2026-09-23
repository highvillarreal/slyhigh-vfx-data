const FPS=['23.976','24','25','29.97','30','47.952','48','50','59.94','60','100','119.88','120'];
const GAMMAS={Sony:['S-Gamut3.Cine / S-Log3','S-Gamut3 / S-Log3','Rec.709'],ARRI:['LogC3 / ARRI Wide Gamut 3','LogC4 / ARRI Wide Gamut 4','Rec.709'],RED:['REDWideGamutRGB / Log3G10','Rec.709'],Blackmagic:['Blackmagic Wide Gamut / Film Gen 5','Extended Video','Rec.709'],Canon:['Cinema Gamut / Canon Log 2','Cinema Gamut / Canon Log 3','Rec.709']};
const CAMERAS=[
['Sony','FX30','APS-C / Super 35','E'],['Sony','FX3','Full frame','E'],['Sony','FX6','Full frame','E'],['Sony','FX9','Full frame','E'],['Sony','VENICE 2','Full frame',''],
['ARRI','ALEXA Mini LF','Large format','LPL'],['ARRI','ALEXA 35','Super 35','',1],['ARRI','ALEXA LF','Large format','LPL'],
['RED','KOMODO 6K','Super 35','RF'],['RED','KOMODO-X','Super 35',''],['RED','V-RAPTOR','',''],['RED','V-RAPTOR XL','',''],
['Blackmagic','Pocket Cinema Camera 4K','Four Thirds','MFT'],['Blackmagic','Pocket Cinema Camera 6K','Super 35','EF'],['Blackmagic','Pocket Cinema Camera 6K Pro','Super 35','EF'],['Blackmagic','URSA Mini Pro 12K','Super 35',''],
['Canon','C70','Super 35','RF'],['Canon','C300 Mark III','Super 35',''],['Canon','C400','Full frame','RF']
].map(([make,model,sensor,mount,color=0])=>({make,model,sensor,mount,color:GAMMAS[make][color]}));
const LENSES=[
['Sony','FE 24–70mm F2.8 GM','ZOOM','24–70 mm','E'],['Sony','FE 24–70mm F2.8 GM II','ZOOM','24–70 mm','E'],['Sony','FE 16–35mm F2.8 GM','ZOOM','16–35 mm','E'],['Sony','FE 70–200mm F2.8 GM','ZOOM','70–200 mm','E'],['Sony','FE 35mm F1.4 GM','PRIME','35 mm','E'],['Sony','FE 50mm F1.2 GM','PRIME','50 mm','E'],['Sony','FE 85mm F1.4 GM','PRIME','85 mm','E'],
['Sigma','18–35mm F1.8','ZOOM','18–35 mm',''],['Sigma','24–70mm F2.8','ZOOM','24–70 mm',''],...['35','50','85'].map(f=>['Sigma',f+'mm','PRIME',f+' mm','']),
...['24','35','50','85'].map(f=>['Rokinon / Samyang','Cine DS '+f+'mm','PRIME',f+' mm','']),
['ARRI / ZEISS','Ultra Prime','PRIME','',''],['ARRI / ZEISS','Master Prime','PRIME','',''],['Cooke','S4/i','PRIME','',''],['Cooke','S7/i','PRIME','',''],['Atlas','Orion','ANAMORPHIC','',''],['Cooke','Anamorphic','ANAMORPHIC','',''],['Hawk','Anamorphic','ANAMORPHIC','',''],['Sirui','Anamorphic','ANAMORPHIC','','']
].map(([make,model,type,range,mount])=>({make,model,type,range,mount}));
const CAPTURE_TYPES=['GENERAL','CAMERA','LIGHTING','SET','MATERIAL','ACTOR','PROP','TRACKING','COLOR','CONTINUITY'];
