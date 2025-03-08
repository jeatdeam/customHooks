# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```


Cuando usar customHooks y cuando no
Decidir si algo debe ser un **custom hook** en React depende de si necesitas **reutilizar lógica de estado o efectos** en diferentes componentes. Los **custom hooks** son una herramienta poderosa para **abstraer** y **compartir lógica** en aplicaciones React. Aquí te dejo algunas pautas para saber cuándo deberías crear un custom hook:

### 1. **Lógica que se repite entre varios componentes**

Si tienes una **lógica de estado, efectos secundarios (side effects)** o lógica relacionada con el ciclo de vida de componentes que se repite en varios componentes, esa lógica **debería** ser extraída a un **custom hook**. Esto permite evitar la duplicación y facilita la reutilización.

#### Ejemplo:

Si en múltiples componentes necesitas manejar la lógica de un contador o el manejo de un formulario, puedes crear un custom hook para manejar ese estado o comportamiento y reutilizarlo en varios lugares.

```tsx
// Custom hook para manejo de contador
import { useState } from 'react';

function useCounter(initialValue: number = 0) {
  const [count, setCount] = useState(initialValue);

  const increment = () => setCount(count + 1);
  const decrement = () => setCount(count - 1);

  return {
    count,
    increment,
    decrement
  };
}

export default useCounter;
```

Ahora puedes usar este custom hook en varios componentes:

```tsx
// Componente A
import useCounter from './useCounter';

function ComponentA() {
  const { count, increment, decrement } = useCounter(10);

  return (
    <div>
      <h2>Componente A</h2>
      <p>Contador: {count}</p>
      <button onClick={increment}>Incrementar</button>
      <button onClick={decrement}>Decrementar</button>
    </div>
  );
}

// Componente B
import useCounter from './useCounter';

function ComponentB() {
  const { count, increment, decrement } = useCounter(5);

  return (
    <div>
      <h2>Componente B</h2>
      <p>Contador: {count}</p>
      <button onClick={increment}>Incrementar</button>
      <button onClick={decrement}>Decrementar</button>
    </div>
  );
}
```

### 2. **Lógica compleja que necesita ser compartida entre componentes**

Si tienes lógica compleja (por ejemplo, manejo de formularios, validación, interacción con una API, etc.) que involucra **efectos secundarios** o **mutación de estado**, deberías considerar extraer esa lógica en un custom hook para que se pueda compartir sin necesidad de repetir el código.

#### Ejemplo de custom hook con efecto:

```tsx
import { useState, useEffect } from 'react';

function useFetch(url: string) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(url);
        const result = await response.json();
        setData(result);
      } catch (error) {
        setError('Error al cargar los datos');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [url]);

  return { data, loading, error };
}

export default useFetch;
```

Con este custom hook, puedes manejar la lógica de la petición HTTP en cualquier componente de tu aplicación:

```tsx
import useFetch from './useFetch';

function Component() {
  const { data, loading, error } = useFetch('https://api.example.com/data');

  if (loading) return <p>Cargando...</p>;
  if (error) return <p>{error}</p>;

  return <div>{JSON.stringify(data)}</div>;
}
```

### 3. **Evitar la repetición de lógica en el ciclo de vida de los componentes**

Si tienes lógica de ciclo de vida del componente (como manejar suscripciones, temporizadores, o cualquier tipo de lógica de efecto secundario) que debe ejecutarse de manera similar en diferentes componentes, un custom hook es útil para evitar la duplicación.

#### Ejemplo de custom hook para manejar un intervalo:

```tsx
import { useState, useEffect } from 'react';

function useInterval(callback: () => void, delay: number) {
  useEffect(() => {
    if (delay === null) return;

    const interval = setInterval(callback, delay);
    return () => clearInterval(interval);
  }, [callback, delay]);
}

export default useInterval;
```

Ahora puedes usar este hook en cualquier componente:

```tsx
import { useState } from 'react';
import useInterval from './useInterval';

function Timer() {
  const [seconds, setSeconds] = useState(0);

  useInterval(() => {
    setSeconds(prevSeconds => prevSeconds + 1);
  }, 1000);

  return <div>{seconds} segundos</div>;
}
```

### 4. **Evitar la repetición de lógica de validación o transformación de datos**

Si necesitas realizar operaciones como validación de formularios, normalización de datos, o formateo de valores en varios lugares de la aplicación, puedes crear un custom hook para centralizar esta lógica.

#### Ejemplo de custom hook para validación de formulario:

```tsx
import { useState } from 'react';

function useFormValidation() {
  const [errors, setErrors] = useState<string[]>([]);

  const validate = (value: string) => {
    if (value.trim() === '') {
      setErrors(['Este campo es obligatorio']);
    } else {
      setErrors([]);
    }
  };

  return { errors, validate };
}

export default useFormValidation;
```

### 5. **Cuando la lógica depende de otros hooks**

Si la lógica que quieres abstraer depende de otros hooks de React (por ejemplo, `useState`, `useEffect`, etc.), entonces también es un buen caso para crear un custom hook.

#### Ejemplo de custom hook con `useState` y `useEffect`:

```tsx
import { useState, useEffect } from 'react';

function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return width;
}

export default useWindowWidth;
```

### 6. **Cuándo NO usar un Custom Hook**

- **Cuando solo se necesita lógica local**: Si la lógica o el estado solo es necesario para un único componente y no tiene necesidad de ser reutilizada, no necesitas crear un custom hook.
  
- **Cuando no se tiene una clara abstracción o reutilización**: Si la lógica no tiene un propósito claro de reutilización o no se comparte entre varios componentes, no tiene sentido crear un custom hook. El uso excesivo de custom hooks puede hacer que tu código se vuelva innecesariamente complejo.

### Resumen:
Un **custom hook** debe usarse cuando:
- Tienes lógica que debe ser **reutilizada** en múltiples componentes.
- Tienes lógica compleja que involucra **efectos secundarios** o **gestión de estado**.
- Necesitas **centralizar la lógica** (como validación de formularios, manejo de API, eventos, etc.).
- La lógica depende de otros hooks de React y deseas organizarla mejor.

Cuando **no** usarlo:
- Si la lógica es específica de un solo componente y no se necesita compartir.
- Si no hay una razón clara para abstraer el código en un hook reutilizable.

Los **custom hooks** son una herramienta potente y permiten organizar mejor el código y hacerlo más reutilizable.


//Que es un pull request
Un **Pull Request** (PR) es una solicitud para **integrar los cambios** que has hecho en una rama de tu repositorio a otra rama, generalmente al **repositorio principal** o a una rama de desarrollo. En términos simples, es una forma de decir: "He terminado de hacer algunos cambios en mi rama, ¿pueden revisarlos e integrarlos a la rama principal o de desarrollo?"

### En qué contexto se utiliza un Pull Request:

- **Colaboración en proyectos**: Los Pull Requests son comunes cuando varias personas están trabajando en un proyecto y necesitan revisar y aprobar cambios antes de que se integren en la base de código principal. Esto es especialmente útil en plataformas como **GitHub**, **GitLab** y **Bitbucket**.
  
- **Revisión de código**: Los PR permiten que los compañeros de equipo revisen tu código antes de fusionarlo (merge) a la rama principal o a otra rama relevante. Durante la revisión, se pueden discutir aspectos como la funcionalidad, la legibilidad, el estilo del código y las posibles mejoras.

### Flujo básico de trabajo con un Pull Request:

1. **Hacer cambios en una rama**:  
   Comienzas haciendo cambios en una **rama separada** (por ejemplo, `feature-xyz`, `bugfix-123`, etc.). Este es un proceso estándar para evitar que los cambios se integren directamente en la rama principal (por lo general, la rama `main` o `master`).

2. **Pushear los cambios al repositorio remoto**:  
   Una vez que hayas hecho tus cambios y los hayas confirmado (committed) en tu máquina local, los **empujas** (push) a tu repositorio remoto, es decir, a GitHub, GitLab o cualquier otra plataforma que uses.

   ```bash
   git push origin feature-xyz
   ```

3. **Crear un Pull Request**:  
   Después de hacer push de tu rama a GitHub, GitLab, etc., puedes ir al repositorio remoto y crear un Pull Request. Esto significa que le estás diciendo a los administradores del repositorio (o a tu equipo) que deseas que los cambios de tu rama se revisen e integren en la rama principal (o cualquier otra rama de destino).

   En GitHub, puedes hacerlo desde la interfaz web, seleccionando la rama que quieres integrar y la rama en la que deseas fusionar los cambios (por ejemplo, `main` o `develop`).

4. **Revisión del código**:  
   Los colaboradores o mantenedores del repositorio pueden revisar tu Pull Request. Durante esta revisión, pueden dejar comentarios, sugerir mejoras, e incluso solicitar cambios adicionales antes de aprobar el PR.

5. **Aprobación y fusión (merge)**:  
   Una vez que el PR ha sido revisado y aprobado, la rama con los cambios se fusiona con la rama principal (o cualquier otra rama de destino). Esto integra efectivamente tus cambios en el proyecto.

   El PR generalmente se cierra después de que se realiza la fusión (merge), y los cambios se convierten parte del historial de la rama principal.

### ¿Por qué usar Pull Requests?

- **Control de calidad**: Los PRs permiten que otros revisen el código antes de que se fusione. Esto reduce errores y mejora la calidad del código.
- **Colaboración**: Fomentan el trabajo en equipo, ya que otros pueden aportar ideas o sugerencias sobre tu código.
- **Documentación**: Los PRs actúan como una forma de documentar los cambios importantes que se están haciendo. Además, cada PR tiene un historial y comentarios que pueden ser útiles a largo plazo.
- **Manejo de conflictos**: Si dos personas trabajan en el mismo archivo, Git podría generar un conflicto. Con los PRs, puedes ver y resolver estos conflictos antes de que los cambios se fusionen.

### Ejemplo de flujo con Pull Request:

1. **Crear una rama**:
   ```bash
   git checkout -b feature-login
   ```

2. **Hacer algunos cambios y confirmarlos**:
   ```bash
   git add .
   git commit -m "Añadir pantalla de login"
   ```

3. **Subir la rama al repositorio remoto**:
   ```bash
   git push origin feature-login
   ```

4. **Crear el Pull Request**:
   - En la plataforma (GitHub, GitLab, etc.), crear un nuevo PR para fusionar la rama `feature-login` a `main`.

5. **Revisión y fusión**:
   - El equipo revisa el PR, hace comentarios o sugiere cambios.
   - Cuando todo está listo, el PR se aprueba y se fusiona con `main`.

### Resumen:

Un **Pull Request** es una solicitud para revisar y fusionar cambios de una rama a otra en un repositorio. Es una herramienta fundamental para la colaboración en equipos, permitiendo la revisión de código y la integración controlada de cambios.

Si tienes más preguntas o necesitas detalles adicionales, ¡avísame! 😊




