# 🚀 Guía de Despliegue en GitHub Pages para "Pla-estiu"

Esta aplicación de campamento y entrenamientos de baloncesto ha sido preparada y optimizada con **arquitectura híbrida fuera de línea (resiliencia local)** para tu nuevo repositorio [Pinetys/Pla-estiu](https://github.com/Pinetys/Pla-estiu). 

Dado que GitHub Pages es una plataforma exclusiva para hosting de archivos estáticos (cliente), hemos diseñado un motor de contingencia inteligente. Si el navegador no puede encontrar el servidor de Express (por ejemplo, al estar alojado de forma estática en GitHub Pages), **la aplicación lo detecta de manera automatizada y conmuta al modelo biomecánico local**, el cual calcula estimulaciones calóricas, sudoración estival, fatiga rotuliana, y genera rutinas personalizadas de forma inmediata en el cliente.

---

## 🛠️ Modificaciones Realizadas para la Compatibilidad

1. **Vite Base Path (`vite.config.ts`)**: Se configuró `base: './'` para asegurar que todos los recursos (JS, CSS, imágenes) se carguen mediante rutas relativas. Esto evita el clásico error de "pantalla en blanco" que ocurre por directivas absolutas en las URL secundarias de GitHub Pages (como `Pinetys.github.io/Pla-estiu/`).
2. **Modelo de Análisis y Rutinas IA Local**: Implementamos conmutaciones dentro de `AIPlanAnalysis.tsx` y `PlayerProfileWorkspace.tsx` para realizar simulaciones de última generación en el propio navegador si la conexión al servidor de Node/Express no existe.
3. **Flujo de Despliegue Automatizado (`.github/workflows/deploy.yml`)**: Diseñamos un flujo de trabajo para GitHub Actions que se activa automáticamente al subir tus cambios a la rama principal de tu repositorio.

---

## 📋 Pasos para Publicar en GitHub Pages

Dado que el botón **Save** (Guardar) de la sección de ramas puede quedarse inhabilitado o bloquearse en GitHub por bloqueos de interfaz o permisos de Git, hemos implementado el método **más moderno, seguro e infalible**: **Despliegue Directo de GitHub Actions** (sin necesidad de configurar ramas manualmente ni hacer clic en "Save").

A continuación tienes los dos métodos disponibles. Te recomendamos usar el **Método 1**, ya que soluciona directamente el problema del botón y el Error 404 del despliegue.

---

### 🔥 MÉTODO 1: Despliegue Directo con GitHub Actions (¡Recomendado y Solución al Error 404!)
Este error **404** en GitHub Actions ocurre porque en tu **nuevo repositorio (`Pla-estiu`)**, GitHub Pages no está activado o está esperando que selecciones una rama en lugar de usar Actions. Para solucionarlo de inmediato:

1. **Permitir acciones en tu nuevo repositorio**:
   * En tu nuevo repositorio de GitHub [Pinetys/Pla-estiu](https://github.com/Pinetys/Pla-estiu), ve a la pestaña superior **Settings** (Configuración).
   * En la barra lateral izquierda, baja y haz clic en **Actions** > **General**.
   * Baja al final de esa página hasta la sección llamada **Workflow permissions**.
   * Selecciona **Read and write permissions** (Permisos de lectura y escritura).
   * Pulsa el botón **Save** (fijando los permisos).

2. **Habilitar GitHub Pages (¡Y quitar el error 404!)**:
   * En el menú lateral izquierdo de **Settings**, haz clic sobre **Pages** (dentro de la sección *Code and automation*).
   * En la sección **Build and deployment**, busca la opción **Source** (Origen).
   * Actualmente pondrá: `Deploy from a branch`. Cambia este desplegable a: **`GitHub Actions`**.
   * **Nota importante**: Al hacer esto, ¡ya está! No necesitas seleccionar ninguna rama o pulsar un botón "Save" abajo en esta sección.

3. **Volver a ejecutar el despliegue (Sin escribir código)**:
   * Ve a la pestaña **Actions** en la cabecera superior de tu repositorio.
   * Selecciona la tarea fallida más reciente en la lista (que se llama `Deploy to GitHub Pages`).
   * En la esquina superior derecha, haz clic en el botón **Re-run jobs** y selecciona **Re-run all jobs**.
   * Verás cómo ahora el proceso compila en verde completo y tu web se publica con éxito. ¡Superado el 404! 🚀

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
👉 **`https://Pinetys.github.io/Pla-estiu/`**

---

¡Disfruta de tu planificador estival de baloncesto totalmente funcional y responsivo en la web! 🏀⚡
