# Aplicación para la gestión de catálogos con IA

## Ejecución de la aplicación

- Inicializar la variable `OPENAI_API_KEY` ubicada en la línea 19 del archivo docker-compose.yml ubicado en la raiz del proyecto.

- Ejecutar el comando `docker-compose up`

## ¿Cómo usar la aplicación?

La aplicación consta de 2 páginas, la página de Inicio y la de Gestión de Catálogo.

La página de inicio es una galaría de productos, el botón de agregar al carrito o favoritos no tiene funcionalidad, la barra de búsqueda está integrada al back-end y se implementó paginación, en caso de haber suficientes productos permite navegar entre páginas.

La página de Gestión de Catálogo consta de dos tabs:

1. Registrar Producto: Formulario para registrar productos, no tiene integración con IA sólo es con fines de prueba.

2. Gestión de Catálogo: Esta funcionalidad está integrada con IA, cuenta con un select que permite seleccionar entre "Descripción de productos" e "Imagen".

    1. Descripción de productos: Pedirá seleccionar una imagen para poder hacer la petición al finalizar la petición se mostrará el resultado al final de la página y esta habilitará el botón de "Usar en Registro de Producto" el cual permite tomar toda la información ingresada más la generada y precargar esta información en el formulario de creación de productos.

    2. Imagen: Solicita un nombre y una descripción de producto, con base a esto generará la imagen y mostrará una preview, al igual que la anterior habilitará el botón de "Usar en Registro de Producto" el cual permite tomar toda la información ingresada más la generada y precargar esta información en el formulario de creación de productos.

## ¿Cómo abordé el problema?

### Stack

Para la realización del proyecto utilicé las siguientes herramientas:

1. Python
2. FastApi
3. React - Next.js
4. Postgresql
5. Docker
6. OpenApi - Api y modelos.

> Observaciones: A pesar de que Python no está en mi stack principal decidí tomar el reto de hacerlo en el stack sugerido.

### Arquitectura

Decidí utilizar un solo back-end por simplicidad para la realización de la prueba, pero a futuro consideraría separar los servicios de generación de imagenes y de nombre/descripción de productos en un microservicio a parte, Considero que podría ofrecerse como SaaS y generar plug-ins, librearias para los frameworks de frontend principales o facilitar integraciones con este servicio desde las plataformas de e-commerce más famosas cómo VTEX, Shopify, entre otros.

En caso de que la plataforma de e-commerce sea parte del scope igual consideraria mantener estos servicios a parte, la razón es que este servicio es operativo y no es necesario para los usuarios del e-commerce, entonces optaria por una arquitectura de microservicios, esto permitiría agregar más carga sobre el servicio de IA permitiendo automatizaciones en batch para disminuir aún más la operación del e-commerce.

También considero que la parte de gestión del catálogo se debe separar del e-commerce principal por temas de seguridad y también porque no son funcionalidades enfocadas al consumidor final de la aplicación (compradores de un e-commerce). En el caso de esta prueba se dejó en el mismo front-end para aprovechar el tiempo al máximo.

### Tecnologías

Back-end: considero que python es una de los lenguages más usados para la creación de modelos, o la integración con modelos ya existentes. Se podría decir que la mayoría de SDKs que existen para IA están principalmente en python y eso lo hace casi que una obligación a la hora de hacer este tipo de integraciones. En caso de requerir otro tipo de funcinalidades se podría dejar la integración con la IA desde un back-end en python y usarlo como un middleware, un servicio externo para otro que puede ser el principal.

Front-end: Lo elegí por su versatilidad y por ser una de las herramientas que he trabjado durante años, considero que para el objetivo de este POC la libertad que permite react frente a framework más estructurados como Angular es importante. Adicionalmente la versatilidad que ofrece react hacer que componentes como el del cátalogo sea fácil de realizar sin tener que pasar por reglas estrictas para la implementación como lo sería en Angular. Con reglas estrictas me refiero a tener que usar anotaciones como @input, @output o de servicios de angular los cuales no son malos pero pueden llevar más tiempo en implementar.

Postgresql: Elegida por ser parte del stack sugerido, por ser opensource, por la experiencia previa y por la potencia que tiene.

OpenIA: He elegido los modelos de OpenIA por que son modelos con los que he tenido experiencia trabajado/estudiando, además porque la forma en la que se consume su API es usada en otros provedores de LLMs por lo cual considero un plus en caso de querer hacer cambio de provedor sin afectar la implementación actual. Sobre la versión de modelos elegí lo último disponible sin embargo para este tipo de tarea considero que no es necesario un modelo con una alta capacidad de razonamiento, si no que con un modelo generativo más básico podría hacerse.

### Trade-offs y trabajos a futuro

1. No tener un estilo arquitectonico definido en el back-end, para tener más velocidad en el desarrollo, en caso de tener más tiempo lo hubiese estructurado mejor, separado más el código y modularizado más.

2. En los objetos de transferencia de datos DTO, utilicé camel-case, esto no es común en python puesto que el preferido es snake case, sin embargo considero que para la integración con APIs externas en otros lenguages es importante mantener un estándar para la nomeclatura de variables.

3. En el front-end no integré librerias para consumo de apis, como axios por ejemplo. Tampoco hice separación de las funciones donde se hacen esto consumos y los modelos quedaron en algunos caso definidos en los mismos componentes, todo esto para aprovechar el tiempo al máximo. Si tuvise más tiempo esto sin duda es una de las cosas que implementaria.

4. Combinar la funcionalidad de IA y la página de productos, a nivel de interfaz de usuario. Si tuviese más tiempo hubiese hecho un front y un backend adicionales.

5. Para darle utilidad a las funcionalidades creadas realicé una funcionalidad que permite tomar toda la infomración registrada y llevarla al formulario de registro de productos. En caso de tener más tiempo haría un trabajo en batch y podría subir no solo una si no varias imagenes o un archivo con nombres y descripciones y generar las imagenes en un trabajo programado (cron-job).

6. En pro de mantener la calidad hice que el servicio de listdo de productos esté paginado, también tiene una funcionalidad de search muy básica, en caso de tener más tiempo hubiese implementado una función y un índice que me permita hacer ranking de los productos para así retornar los resultado más acordes, incluso retornar algunos resultado a pesar de no tener coincidencias acertadas al 100%.

7. Las imagenes se transfieren como multipart/form-data en las peticiones y en la respuesta como uri data base64. Esto con el fin de poder retorna la imagen generada más los datos adicionales del producto. Si hubiese tenido más tiempo hubiese hecho esto con localstack para simular un S3, en un proyecto real no aconsejo retornar base64 debido a que puede aumentar alredor de un 30% los tamaños de los payloads.

8. En caso de tener más tiempo generaría unahabilitará el botón de "Usar en Registro de Producto" el cual permite tomar toda la información ingresada más la generada y precargar esta información en el formulario de creación de productos.

9. En caso de tener más tiempo hubiese hecho que las peticiones a la api que integra IA genera un registro en el back-end, para que permiter iterar sobre el resultado como si fuese un chat al estilo ChatGPT, además en el caso de hacer una funcionalida de procesamiento en lotes facilitaría la revisión de los resultados, aprobarlos en caso de estár correctos o de iterarlos hasta lograr el resultado esperado.

10. Como trabajo futuro considero que se podrían añadir capas de validación, esto con el fin de validar que las respuestas de la IA sean acordes a lo que se require. Esta capa de validación podría ser simplemente nuevas llamadas a la AI pidiendole que valide el resultado generado.

11. Adicionalmente en los trabajos a futuro se podría añadir más contexto en los prompts, como por ejemplo para que tipo de tienda es el producto, a qué tipo de público va dirigido el e-commerce para lograr resultados acordes al sitio. En caso de ofrecer el servicio a muchos e-commerces se podría guardar un registro de este contexto en base de datos y adjuntarlo al promt antes de hacer el request a la api de IA.


> Nota: por temas de tiempo, y de que openIA no me verificó la organización a tiempo para poder usar los modelos de generación de imagenes esta funcionalidad no la pude probar, posiblemente falle al intentar usarla.

