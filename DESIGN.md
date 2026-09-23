# Sistema de experiencia — SLYHIGH VFX Tools

## 1. Arquitectura de información

El proyecto contiene días de rodaje; cada día contiene escenas; cada escena contiene setups; cada setup contiene shots. El shot es el espacio principal de trabajo y mantiene el TAKE actual. La biblioteca pertenece al proyecto. Tools puede utilizar el contexto del shot activo sin modificarlo. Export reúne las salidas de producción.

Se conserva la estructura persistida de v0.1. Los cambios son de presentación e interacción, con campos aditivos para procedencia, herencia y normalización.

## 2. Navegación

Projects → proyecto / Shot log → Shot. Las cuatro pestañas son Shoot, Library, Tools y Export. Crear, editar y catalogar abre pantallas completas. Back restaura el contexto de proyecto/shot y la posición de desplazamiento. La navegación inferior se oculta en flujos de creación para reducir salidas accidentales y cuando se abre el teclado.

Los únicos diálogos de producto son las confirmaciones destructivas. La impresión construye un DOM exclusivo para impresión, sin abrir ventanas ni reemplazar la pantalla activa.

## 3. Jerarquía visual

Negro casi puro; texto blanco; grises neutros; morado reservado a selección, procedencia y acciones principales. Verde indica almacenamiento confirmado y rojo fallos/acciones destructivas. Marca monocromática única en el encabezado.

Shot code y TAKE dominan la pantalla. La cámara se edita en filas, sin botón Edit. La captura tiene un acceso persistente junto al TAKE para evitar volver al principio del shot. Las cantidades, el código de escena y la fecha ocupan un plano secundario.

## 4. Componentes

- Fila de lista de al menos 76 px con nombre, subtítulo y chevron.
- Fila editable de cámara de al menos 61 px, control nativo y unidad separada.
- Campos de 16 px como mínimo para evitar el zoom automático de Safari.
- Controles táctiles de al menos 44 px; acciones principales de 56 px.
- Consola TAKE con acciones − / +, número inmediato y anuncio accesible.
- Etiquetas EMPTY, INHERITED, PRESET y USER ENTERED para distinguir origen.
- Panel de confirmación destructiva con Cancel y acción explícita.
- Estados SAVING, SAVED ON DEVICE y NOT SAVED / RETRY.

Sin fuentes externas, imágenes decorativas, gradientes ni dependencia de hover. Se respeta reduced-motion y safe-area-inset.

## 5. Pantallas y flujos

**Projects:** una introducción breve, lista de producciones con código y cantidad real de shots, New project. No datos de ejemplo dentro de campos.

**New project:** Display name → código normalizado automático, editable → operador → Create. Se rechazan códigos duplicados y nombres vacíos.

**Shot log:** días y shots en filas; crear shot como acción principal. Scene/Setup conocidos se heredan como contexto real.

**New shot:** fecha local, escena, setup, código vacío y tipos. Herencia activada por defecto cuando existe un shot anterior. Copia únicamente camera state; TAKE empieza en 1 y notas, medios, medidas y referencias específicas quedan vacíos.

**Shot:** contexto, TAKE, estado de cámara editable, tipos, captura, medida, notas por TAKE y acceso a registros. Cada entrada se guarda en IndexedDB. Las notas admiten dictado del teclado.

**Capture:** el botón abre el selector/cámara inmediatamente. Archivo y referencia se confirman en una sola transacción. Luego aparece Capture saved con preview, GENERAL y nota opcional. Done no condiciona el guardado. El TAKE se fija al iniciar la captura.

**Measurement:** extremos, valor, unidad, método y confianza. Se preserva la representación original y se agrega la conversión SI para unidades conocidas.

**Library:** cámaras y lentes en filas. Seleccionar preset rellena solamente datos conocidos y marca su procedencia. Los modelos genéricos no inventan montura, focal concreta ni modo de sensor.

**Tools:** Screen assets, Tracking markers, Lens distortion y Scale references. Los trackers de pantalla permanecen dentro de la familia cromática seleccionada. Los markers impresos reservan IDs de proyecto incrementales. Todas las salidas de impresión usan el mismo documento.

**Export:** JSON de metadatos, CSV de shots, backup con archivos originales y reporte del shot activo. Los archivos reciben nombres derivados del contexto.

## 6. Estados de interacción y recuperación

Vacío significa ausencia de dato: no se usan placeholders de ejemplo. Los presets son valores asignados visibles y editables. La edición de un dato heredado cambia su procedencia a USER ENTERED.

Un fallo al guardar captura aborta tanto el archivo como su referencia: no quedan referencias colgantes. El archivo sigue en memoria para Retry y descarga de emergencia. Otros fallos de almacenamiento conservan el estado en memoria y permiten reintentar desde el indicador del encabezado.

Eliminar cámara/lente informa cuántos shots la usan, anula esos IDs y conserva focal, focus y demás valores independientes. Eliminar proyecto exige escribir el código exacto y elimina registros y medios en una transacción.

No se incorporan login, backend, nube, IA, ingest de cámara, procesamiento de escaneos ni sincronización PostCore.
