![build](https://github.com/esmalleydev/srating.io-gui/actions/workflows/build.js.yml/badge.svg)
![version](https://img.shields.io/github/package-json/v/srating-io/gui)
# [srating.io](https://srating.io)

This is the open-source GUI project for [srating.io](https://srating.io). This project uses [nextjs](https://nextjs.org/), [reactjs](https://reactjs.org/).

Prerequisites: typescript, nodejs, npm.

## Looking for the API documentation?
### [docs.srating.io](https://docs.srating.io)

## Getting Started
> [!NOTE]
> An unrestricted API key is required, to fully run this locally / develop.
> Feel free to check out the project though (all api calls will fail) or [Contact](contact@srating.io) if you are interested.

1. Clone or download this repository.

    ```sh
    git clone https://github.com/srating-io/gui
    cd srating.io-gui
    ```

2. Install build dependencies in the project directory.

    ```sh
    npm install
    ```
3. Set up a .env.local file in the root

    ```
    SERVER_PROTOCAL=http
    SERVER_HOST=localhost
    SERVER_PORT=3500
    SERVER_SECRET=my_unrestricted_api_key
    SERVER_ENVIRONMENT=development

    NEXT_PUBLIC_CLIENT_PROTOCAL=http
    NEXT_PUBLIC_CLIENT_HOST=localhost
    NEXT_PUBLIC_CLIENT_PORT=4000
    NEXT_PUBLIC_CLIENT_USE_ORIGIN=false
    NEXT_PUBLIC_CLIENT_PATH=''
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=foo
    NEXT_PUBLIC_ENV=dev

    NEXT_PUBLIC_WS_HOST=localhost
    NEXT_PUBLIC_WS_PORT=8080
    NEXT_PUBLIC_WS_PATH='ws'
    ```

4. Run the web client with webpack for local development.

    ```sh
    npm run dev
    ```

5. Build the client and start production build

    ```sh
    npm ci --omit=dev
    npm run build
    npm run start
    ```

## Directory Structure

```
.
└── srating.io-gui
  ├── app                     # All the nextjs pages live here
  ├── blog                    # Blog entries
  ├── components              
  │   ├── generic             # All the react components
  │   ├── handlers            # useEffects which handling loading things like sessions, dictionary, favorite data
  │   ├── helpers             # Classes with helper functions for formatting data on specific database tables
  │   ├── hooks               # Custom React hooks
  │   ├── utils               # Utility functions for things like Text, Color, Style, etc
  │   ├── ux                  # Resuable UX components to be used across system
  ├── contexts                # Custom react contexts
  ├── redux                   # Redux features / store logic
  ├── styles                  # CSS
  ├── Surface                 # nextjs pages without needing nextjs
  ├── types                   # Common TypeScript interfaces/types
```

## Client api
These calls run on the client. It will attach any required headers to the fetch request.

### Using the component
```jsx
'use client';
import { useClientAPI } from '@/components/clientAPI';

useClientAPI({
  'class': 'game',
  'function': 'getScores',
  'arguments': {
    'start_date': '2024-01-26',
  },
}).then((response) => {
  console.log(response);
}).catch((e) => {
  console.log(e);
});
```

## Server api
These calls run on the server. It will attach any required setting as well as handling caching the calls for performance

### Using the component
```jsx
'use server';
import { useServerAPI } from '@/components/serverAPI';

const revalidateScoresSeconds = 20; // cache scores for 20 seconds
  
const scores = await useServerAPI({
  'class': 'game',
  'function': 'getScores',
  'arguments': {
    'start_date': '2024-01-26',
  }
  'cache': revalidateScoresSeconds,
});

console.log(scores);
```


## Unit tests
In the project root run:
`npx jest test`
Tests go in the `tests` folder and should have the same folder structure of the file they are testing


### Tips
May need to clear out .next and node_modules folder before rebuilding
`rm -r node_modules`
`rm -r .next`




<!-- ![status](https://img.shields.io/uptimerobot/status/m793600490-481ed5a22e5d58de53fdb32a) -->
<!-- ![uptime](https://img.shields.io/uptimerobot/ratio/7/m793600490-481ed5a22e5d58de53fdb32a) -->


