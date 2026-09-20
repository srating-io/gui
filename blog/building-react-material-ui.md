---
title: 'ux.srating.io'
excerpt: "My own React component library, and the docs site where I build and test it."
coverImage: null
date: '2026-09-20T12:00:00.322Z'
author:
  name: 'Evan S'
  picture: '/public/static/images/evan.png'
ogImage:
  url: null
---

# ux.srating.io

All the MUI code I mentioned replacing back in v5.0 is finally gone. Everything on this site now
runs on my own package, [@esmalley/react-material-ui](https://github.com/srating-io/react-material-ui),
and the docs / examples live at [ux.srating.io](https://ux.srating.io).

## What is in it

47 components, currently v1.3.1:

- **Buttons** - Button, IconButton, Tab
- **Containers** - Paper, Slab, Tile, Chip, Columns, Wizard
- **Inputs** - TextInput, Textarea, Select, Switch, DateInput, MultiPicker
- **Tables** - Table (+ Thead, Tbody, Tfoot, Tr, Th, Td) and VirtualTable for the big ranking pages
- **Overlays** - Modal, ErrorModal, Drawer, Plane, Toast, Tooltip, Backdrop
- **Loading** - CircularProgress, LinearProgress, Skeleton
- **Menu** - Menu, MenuItem, MenuList
- **Text** - Typography, CodeBlock, Divider
- **Other** - Calendar, UXBaseline

Plus a separate icons package with 10,609 icons, so I am not pulling in MUI just for a chevron.

Everything is themed off one `useTheme()` hook - backgrounds, primary / secondary, error / warning /
info / success, a full grey ramp, text and link colors. Swap the theme object and every component
follows, so dark mode is basically free. `UXBaseline` handles the css reset.

The styling still works the way I described in v5.0 - hand it a style object, it hashes it into a
css class and injects it. No styled-components, no emotion, no tailwind. It handles nested selectors
too, so `'&:hover'` sits right in the same object.

Ships as both ESM and CJS, built with esbuild.

## The docs site

[ux.srating.io](https://ux.srating.io) is a page per component with live examples, a browser for
all the icons, and a theme page to flip between light and dark.

It is really more of a workbench than documentation. New components get built there first, against
every variant at once, before anything on this site uses them. Much easier to spot that a disabled
state is unreadable when all the states are sitting next to each other on one page.

## Next

More components, and fixing the rough ones I wrote before the docs site existed!
