# 🚀 Guía de Despliegue en GitHub Pages para "Verano"

Esta aplicación de campamento y entrenamientos de baloncesto ha sido preparada y optimizada con **arquitectura híbrida fuera de línea (resiliencia local)** para tu repositorio específico [Pinetys/Verano](https://github.com/Pinetys/Verano). 

Dado que GitHub Pages es una plataforma exclusiva para hosting de archivos estáticos (cliente), hemos diseñado un motor de contingencia inteligente. Si el navegador no puede encontrar el servidor de Express (por ejemplo, al estar alojado de forma estática en GitHub Pages), **la aplicación lo detecta de manera automatizada y conmuta al modelo biomecánico local**, el cual calcula estimulaciones calóricas, sudoración estival, fatiga rotuliana, y genera rutinas personalizadas de forma inmediata en el cliente.

---

## 🛠️ Modificaciones Realizadas para la Compatibilidad

1. **Vite Base Path (`vite.config.ts`)**: Se configuró `base: './'` para asegurar que todos los recursos (JS, CSS, imágenes) se carguen mediante rutas relativas. Esto evita el clásico error de "pantalla en blanco" que ocurre por directivas absolutas en las URL secundarias de GitHub Pages (como `Pinetys.github.io/Verano/`).
2. **Modelo de Análisis y Rutinas IA Local**: Implementamos conmutaciones dentro de `AIPlanAnalysis.tsx` y `PlayerProfileWorkspace.tsx` para realizar simulaciones de última generación en el propio navegador si la conexión al servidor de Node/Express no existe.
3. **Flujo de Despliegue Automatizado (`.github/workflows/deploy.yml`)**: Diseñamos un flujo de trabajo para GitHub Actions que se activa automáticamente al subir tus cambios a la rama principal de tu repositorio.

---

## 📋 Pasos para Publicar en GitHub Pages

Dado que el botón **Save** (Guardar) de la sección de ramas puede quedarse inhabilitado o bloquearse en GitHub por bloqueos de interfaz o permisos de Git, hemos implementado el método **más moderno, seguro e infalible**: **Despliegue Directo de GitHub Actions** (sin necesidad de configurar ramas manualmente ni hacer clic en "Save").

A continuación tienes los dos métodos disponibles. Te recomendamos usar el **Método 1**, ya que soluciona directamente el problema del botón.

---

### 🔥 MÉTODO 1: Despliegue Directo con GitHub Actions (¡Recomendado!)
Este método no requiere ninguna rama `gh-pages` ni te obliga a pulsar el botón "Save" bloqueado. Todo lo compila y publica GitHub automáticamente por detrás:

1. **Permitir acciones en tu repositorio**:
   * En tu repositorio de GitHub [Pinetys/Verano](https://github.com/Pinetys/Verano), ve a la pestaña superior **Settings** (Configuración).
   * En la barra lateral izquierda, baja hasta **Actions** > **General**.
   * Baja al final del todo hasta la sección **Workflow permissions**.
   * Selecciona **Read and write permissions** (Permisos de lectura y escritura).
   * Pulsa **Save** (este botón sí se activa siempre).

2. **Cambiar la Fuente de Pages**:
   * En el mismo menú de **Settings**, haz clic en **Pages** en la columna de la izquierda.
   * En la sección **Build and deployment**, busca la opción **Source** (Origen).
   * Cámbiala de: `Deploy from a branch` a **`GitHub Actions`**.
   * *¡Y listo!* No tienes que seleccionar ninguna rama, ni ruta, ni pulsar ningún botón "Save" adicional abajo.

3. **Subir los cambios**:
   * Haz un commit y sube el código a tu repositorio `main` con Git.
   * Ve a la pestaña **Actions** en la cabecera de tu repositorio de GitHub. Verás la tarea de compilado compilar en verde y publicar tu web sola. ¡Automático!

---

### 📋 MÉTODO 2: El Método Tradicional por Rama (gh-pages)
Si prefieres forzar el uso de la rama `gh-pages` y el botón **Save** sigue sin funcionar, suele deberse a uno de estos motivos:

1. **La rama `gh-pages` aún no se ha creado o subido**: Si ejecutas `git push` en tu consola pero la rama `gh-pages` no existe en tu repositorio en la nube, GitHub muestra el dropdown vacío o deshabilita el guardado. Para solucionarlo, ejecuta un despliegue rápido desde tu consola:
   ```bash
   npm run deploy
   ```
   *(Este comando usará la herramienta `gh-pages` instalada para forzar la creación y subida de la rama a tu GitHub)*.
2. **Ya está activa**: Si el dropdown ya tiene seleccionada la rama `gh-pages` y debajo ves un enlace en color azul, significa que ya ha sido guardado previamente y está activo. Por eso el botón de Guardar está gris (no hay cambios nuevos que guardar).
3. **Refresca la caché**: Selecciona **None**, dale a guardar. Luego vuelve a cargar la página con **Ctrl + F5** (o Cmd + Shift + R en Mac), selecciona de nuevo **gh-pages** y `/ (root)` y el botón Save se desbloqueará de inmediato.

---

## 🚀 Enlace de tu aplicación en vivo:
Una vez completado cualquiera de los dos métodos, tu aplicación estará activa públicamente en:
👉 **`https://Pinetys.github.io/Verano/`**

---

¡Disfruta de tu planificador estival de baloncesto totalmente funcional y responsivo en la web! 🏀⚡
