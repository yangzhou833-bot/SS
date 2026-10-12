# Ebook Social & Map Integration Enhancement

This project delivers enhanced social interactivity to the ebook module and integrates user reading activity directly into the main map view, transforming solo reading into a shared exploration experience.

> [!IMPORTANT]
> Based on your selections, this plan proceeds with:
> - **Library Shelf**: Dedicated friends-reading shelf in the library view.
> - **Annotations**: Sidebar margin notes with direct message (DM) chat shortcuts for seamless discussion.
> - **Map Integration**: Aggregated "Reading Hotspots" shown on the map based on user reading activity in specific locations.

---

### 1. Overview & Core Concept

- **What It Does**: Adds real-time social layers to the ebook experience and visualizes community reading activity on the map.
- **Key Value**: Reduces the isolation of digital reading by enabling collaborative annotation, visible friend activity, and spatial context for shared interests.

---

### 2. User Experience & Visual Design

- **Ebook Library**: Adds a "Friends Reading Now" section to the library, showcasing covers of books currently being read by your connections.
- **Ebook Reader**: Implements a sidebar that tracks margin notes. Each note displays the author's avatar. Tapping a note opens an inline discussion thread, with an integrated "DM" button to move the conversation to private chat.
- **Map Integration**: Aggregates reading data based on location. When multiple friends are reading or annotating from a similar location, a localized "Reading Hotspot" (or footprint cluster) appears on the map, showing which book is popular in that area.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Sidebar Annotation & Discussion**
    - *Chosen*: Sidebar margin notes with integrated DM shortcuts.
    - *Why*: Keeps the main reading experience focused while making community interaction easily accessible. Linking to DMs allows transitioning from public discussion to private conversation without losing context.
- **Decision 2: Spatial Reading Activity**
    - *Chosen*: Aggregated reading hotspots on the main map.
    - *Why*: Leverages our map-centric platform to provide spatial context for shared reading interests, fostering a sense of community based on geographic proximity.

---

### 4. Technical Architecture & Data Strategy

```
┌───────────────────────────┐      ┌──────────────────────────┐
│  Ebook Reading Sidebar    │ <──> │  Firestore Annotations   │
└───────────────────────────┘      └──────────────────────────┘
           │                                 ▲
           ▼                                 │
┌───────────────────────────┐      ┌──────────────────────────┐
│  WebSocket / DM Service   │ <──> │  Real-time Discussion    │
└───────────────────────────┘      └──────────────────────────┘
                                             ▲
┌───────────────────────────┐                │
│    Map Reading Hotspots   │ <──────────────┘
└───────────────────────────┘
```

- **Persistence**: Firestore will store all reading states, annotations, and discussion threads.
- **Real-time**: WebSockets will handle live discussion updates within annotation threads.
- **Data Lifecycle**:
    - Annotations are tied to ebook IDs and chapter/paragraph offsets.
    - Location activity is aggregated via cloud functions triggered by reading events, mapping location coordinates to localized hotspots on the main map.
