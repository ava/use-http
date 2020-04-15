Suspense when delay 3sec:

```js
import React, { Suspense } from 'react';
import { render } from 'react-dom';
import { useFetch, Provider } from './';

const Component = () => {
	const { get, data } = useFetch({ suspense: true });

	const handleClick = async () => get('/delay/3');
	return (
		<>
			<button onClick={handleClick}>Load Data</button>
			{data && (
				<pre>{JSON.stringify(data, null, 2)}</pre>
			)}
		</>
	);
};

<Provider url='https://httpbin.org'>
	<Suspense fallback='Loading...'>
		<Component />
	</Suspense>
</Provider>
```

Load when 404:

```js
import React, { Suspense } from 'react';
import { render } from 'react-dom';
import { useFetch, Provider, ErrorBoundary } from './';

const Component = () => {
	const { get, data } = useFetch({ suspense: true });

	const handleClick = async () => get('/status/404');
	return (
		<button onClick={handleClick}>Load Data</button>
	);
};

<Provider url='https://httpbin.org'>
	<ErrorBoundary fallback={<div>Error</div>}>
		<Suspense fallback='Loading...'>
			<Component />
		</Suspense>
	</ErrorBoundary>
</Provider>
```