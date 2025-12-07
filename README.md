Aquí tienes tu mensaje corregido, manteniendo tu tono original y técnico:

# 💻 Aplicación para la gestión de catálogos con IA

## Ejecución de la aplicación

* Inicializar la variable `OPENAI_API_KEY`, ubicada en la línea 19 del archivo `docker-compose.yml` en la raíz del proyecto.
* Ejecutar el comando `docker-compose up`.

## ¿Cómo usar la aplicación?

La aplicación consta de dos páginas: la página de **Inicio** y la de **Gestión de Catálogo**.

La página de inicio es una **galería de productos**. El botón de "agregar al carrito" o "favoritos" no tiene funcionalidad. La barra de búsqueda está integrada al **backend** y se implementó **paginación**; en caso de haber suficientes productos, permite navegar entre páginas.

La página de Gestión de Catálogo consta de dos *tabs*:

1.  **Registrar Producto:** Formulario para registrar productos, no tiene integración con IA, solo es con fines de prueba.
2.  **Gestión de Catálogo:** Esta funcionalidad está integrada con IA. Cuenta con un *select* que permite elegir entre "Descripción de productos" e "Imagen".
    * **Descripción de productos:** Pedirá seleccionar una imagen para poder hacer la petición. Al finalizar la petición, se mostrará el resultado al final de la página y se habilitará el botón de **"Usar en Registro de Producto"**, el cual permite tomar toda la información ingresada más la generada y precargarla en el formulario de creación de productos.
    * **Imagen:** Solicita un nombre y una descripción de producto. Con base en esto, generará la imagen y mostrará una *preview*. Al igual que la anterior, habilitará el botón de **"Usar en Registro de Producto"**, el cual permite tomar toda la información ingresada más la generada y precargar esta información en el formulario de creación de productos.

---

## 💡 ¿Cómo abordé el problema?

### Stack

Para la realización del proyecto, utilicé las siguientes herramientas:

1.  Python
2.  FastAPI
3.  React - Next.js
4.  PostgreSQL
5.  Docker
6.  OpenAI - API y modelos.

> Observaciones: A pesar de que **Python no está en mi *stack* principal**, decidí tomar el reto de hacerlo en el *stack* sugerido.

### Arquitectura

Decidí utilizar un solo **backend** por simplicidad para la realización de la prueba, pero a futuro consideraría separar los servicios de generación de imágenes y de nombre/descripción de productos en un **microservicio aparte**. Considero que podría ofrecerse como **SaaS** y generar *plug-ins*, librerías para los *frameworks* de **frontend** principales o facilitar integraciones con este servicio desde las plataformas de *e-commerce* más famosas, como VTEX, Shopify, entre otras.

En caso de que la plataforma de *e-commerce* sea parte del *scope*, igual consideraría mantener estos servicios aparte. La razón es que este servicio es operativo y no es necesario para los usuarios del *e-commerce*, entonces optaría por una **arquitectura de microservicios**. Esto permitiría agregar más carga sobre el servicio de IA, permitiendo **automatizaciones en *batch*** para disminuir aún más la operación del *e-commerce*.

También considero que la parte de gestión del catálogo se debe separar del *e-commerce* principal por temas de seguridad y también porque no son funcionalidades enfocadas al consumidor final de la aplicación (compradores de un *e-commerce*). En el caso de esta prueba, se dejó en el mismo **frontend** para aprovechar el tiempo al máximo.

### Tecnologías

* **Backend:** Considero que Python es uno de los **lenguajes más usados** para la creación de modelos o la integración con modelos ya existentes. Se podría decir que la mayoría de **SDKs** que existen para IA están principalmente en Python, y eso lo hace casi que una obligación a la hora de hacer este tipo de integraciones. En caso de requerir otro tipo de funcionalidades, se podría dejar la integración con la IA desde un **backend en Python** y usarlo como un *middleware*, un servicio externo para el servicio principal.

* **Frontend:** Lo elegí por su versatilidad y por ser una de las herramientas que he **trabajado durante años**. Considero que para el objetivo de este **POC**, la libertad que permite **React** frente a *frameworks* más estructurados como Angular es importante. Adicionalmente, la versatilidad que ofrece React hace que componentes como el del **catálogo** sean fáciles de realizar sin tener que pasar por reglas estrictas para la implementación, como lo sería en Angular. Con reglas estrictas me refiero a tener que usar anotaciones como `@input`, `@output` o de servicios de Angular, los cuales no son malos, pero pueden llevar más tiempo en implementar.

* **PostgreSQL:** Elegida por ser parte del *stack* sugerido, por ser *opensource*, por la experiencia previa y por la potencia que tiene.

* **OpenAI:** He elegido los modelos de **OpenAI** porque son modelos con los que he tenido experiencia **trabajando/estudiando**. Además, la forma en la que se consume su API es usada en otros **proveedores de LLMs**, por lo cual considero un *plus* en caso de querer hacer cambio de proveedor sin afectar la implementación actual. Sobre la versión de modelos, elegí lo último disponible; sin embargo, para este tipo de tarea, considero que **no es necesario un modelo con una alta capacidad de razonamiento**, sino que con un modelo generativo más básico podría hacerse.

---

## uture Trade-offs y trabajos a futuro

1.  No tener un **estilo arquitectónico definido en el backend** para tener más velocidad en el desarrollo. En caso de tener más tiempo, lo hubiese estructurado mejor, separado más el código y modularizado más.
2.  En los **objetos de transferencia de datos (DTO)**, utilicé **camel-case**. Esto no es común en Python, puesto que el preferido es **snake\_case**; sin embargo, considero que para la integración con APIs externas en otros lenguajes es importante mantener un **estándar** para la nomenclatura de variables.
3.  En el **frontend**, no integré librerías para consumo de APIs, como **Axios** por ejemplo. Tampoco hice separación de las funciones donde se hacen estos consumos y los modelos quedaron en algunos casos definidos en los mismos componentes. Todo esto para **aprovechar el tiempo al máximo**. Si tuviese más tiempo, esto sin duda es una de las cosas que implementaría.
4.  **Combinar la funcionalidad de IA y la página de productos** a nivel de interfaz de usuario. Si tuviese más tiempo, hubiese hecho un *front* y un *backend* adicionales.
5.  Para darle utilidad a las funcionalidades creadas, realicé una funcionalidad que permite tomar toda la información registrada y llevarla al formulario de registro de productos. En caso de tener más tiempo, haría un **trabajo en *batch*** y podría subir no solo una, sino varias imágenes o un archivo con nombres y descripciones y generar las imágenes en un **trabajo programado (*cron-job*)**.
6.  En pro de mantener la calidad, hice que el servicio de **listado de productos esté paginado**, también tiene una funcionalidad de *search* muy básica. En caso de tener más tiempo, hubiese implementado una función y un índice que me permita hacer **ranking de los productos** para así retornar los resultados más acordes, incluso retornar algunos resultados a pesar de no tener coincidencias acertadas al 100%.
7.  Las imágenes se transfieren como `multipart/form-data` en las peticiones y en la respuesta como **URI data base64**. Esto con el fin de poder retornar la imagen generada más los datos adicionales del producto. Si hubiese tenido más tiempo, hubiese hecho esto con **LocalStack** para simular un S3. En un proyecto real, **no aconsejo retornar base64** debido a que puede aumentar alrededor de un **30%** los tamaños de los *payloads*.
8.  En caso de tener más tiempo, la funcionalidad **"Usar en Registro de Producto"** permitiría tomar toda la información registrada/generada y precargarla en el formulario.
9.  En caso de tener más tiempo, hubiese hecho que las peticiones a la API que integra IA generaran un registro en el **backend**, para que permitiera **iterar sobre el resultado como si fuese un *chat* al estilo ChatGPT**. Además, en el caso de hacer una funcionalidad de procesamiento en lotes, facilitaría la revisión de los resultados, aprobarlos en caso de estar correctos o de iterarlos hasta lograr el resultado esperado.
10. Como trabajo futuro, considero que se podrían añadir **capas de validación**. Esto con el fin de validar que las respuestas de la IA sean acordes a lo que se requiere. Esta capa de validación podría ser simplemente **nuevas llamadas a la AI** pidiéndole que valide el resultado generado.
11. Adicionalmente, en los trabajos a futuro se podría añadir **más contexto en los *prompts***, como por ejemplo para qué tipo de tienda es el producto, a qué tipo de público va dirigido el *e-commerce*, para lograr resultados acordes al sitio. En caso de ofrecer el servicio a muchos *e-commerces*, se podría guardar un registro de este contexto en base de datos y adjuntarlo al *prompt* antes de hacer el *request* a la API de IA.

> **Nota:** Por temas de tiempo, y de que **OpenAI no me verificó la organización a tiempo** para poder usar los modelos de generación de imágenes, esta funcionalidad **no la pude probar**. Posiblemente falle al intentar usarla.