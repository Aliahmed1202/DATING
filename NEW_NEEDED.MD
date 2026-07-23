تمام، دي **Style Instructions** جاهزة تديها لأي AI builder / developer عشان يحسّن شكل أول Demo بتاع **Our Space** ويطلع Premium مش عادي.

انسخها زي ما هي:

```text
Enhance the UI/UX style of the project and make it feel like a polished, romantic, private mobile-first web app for two people.

The design should feel:
- romantic but not childish
- premium but still soft
- clean and modern
- emotional and personal
- mobile-app-like even though it is a web app

Use this color palette:
- Peach: #F8B195
- Coral Pink: #F67280
- Rose: #C06C84
- Purple: #6C5B7B
- Black: #0B0C10
- Background: #FFF8F5 or #FAF7F5
- Card background: #FFFFFF
- Soft border: #F1D8D8

Do not use a basic white/blue dashboard style.
Avoid corporate SaaS design.
Avoid harsh colors.
Avoid too much gray.

Global Style:
- Use rounded corners everywhere, around 20px to 28px.
- Use soft shadows, not harsh shadows.
- Use glassmorphism only lightly for hero cards.
- Use smooth gradients in headers, score cards, and main buttons.
- Use spacious padding and clean spacing.
- Use a mobile-first layout.
- Every screen should look good on a phone first.
- Desktop layout can simply center the phone-style content in a max-width container.

Typography:
- Use a modern clean font.
- Headings should be bold and emotional.
- Body text should be readable and soft.
- Use short text, not long paragraphs inside cards.
- Make important dates and scores visually prominent.

Layout:
- Add a bottom navigation bar like a mobile app.
- Bottom nav items: Home, Memories, Add, Events, Profile.
- The Add button should be centered and visually highlighted.
- Use cards for all content.
- Use icon + title + small description for actions.
- Keep pages clean and not crowded.

Dashboard Design:
- The dashboard should be the most beautiful page.
- Add a romantic cover/header card with a soft gradient.
- Show "Ali & Roma" clearly.
- Show profile avatars side by side.
- Show "Together since 22 Feb 2025".
- Show days together in a large number.
- Add relationship score with a progress bar.
- Add current level name.
- Add individual score cards for Ali and Roma.
- Add quick action buttons:
  - Add Memory
  - Add Event
  - Send Note
- Add a "Latest Memories" section.
- Add an "Upcoming Events" section.

Memories Page:
- Use beautiful memory cards.
- Each card should show:
  - memory title
  - date
  - mood
  - created by
  - reaction
- Good memories should have warm colors.
- Hard moments should use a softer purple/rose style, not negative red.
- Use empty states with friendly messages.
- Add subtle heart/star icons.
- The Add Memory form should feel simple and emotional, not like an admin form.

Events Page:
- Event cards should look like mini invitation cards.
- Show event type, date, time, location, and status.
- Upcoming events should be visually highlighted.
- Completed events should look calm and faded.
- Birthday and anniversary events can have soft accent icons.

Notes Page:
- Notes should look like private message cards or small letters.
- Use a soft paper/card effect.
- Unread notes should be highlighted.
- Use emotional but clean styling.

Profile Page:
- Show avatar, name, nickname, email, birthday, and score.
- Make it feel personal, not like an admin profile.
- Add soft editable fields.

Buttons:
- Primary buttons should use coral/rose gradient.
- Secondary buttons should be white with rose border.
- Buttons should be rounded and large enough for mobile.
- Add hover and tap animations.

Animations:
- Add subtle fade-in animations when pages load.
- Add soft hover effects on cards.
- Add scale animation on buttons when clicked.
- Do not overuse animations.

Components:
- Build reusable components:
  - AppLayout
  - BottomNavigation
  - PageHeader
  - CoupleHeaderCard
  - ScoreCard
  - MemoryCard
  - EventCard
  - NoteCard
  - EmptyState
  - LoadingSkeleton
  - PrimaryButton
  - FormInput

Icons:
- Use Lucide icons.
- Use icons like Heart, Calendar, Star, Gift, Coffee, Camera, Smile, MessageCircle.
- Keep icons consistent in stroke width and size.

Forms:
- Forms should be short and clean.
- Use labels clearly.
- Use rounded inputs.
- Add helper text when useful.
- Show loading state while saving.
- Show success toast after saving.
- Show error toast if something fails.

UX Details:
- Add loading skeletons instead of blank loading screens.
- Add confirmation before delete.
- Disable submit button while saving.
- Make errors human-friendly.
- Make the app feel private and safe.

Final Goal:
The app should feel like a private digital space made specially for Ali and Roma, with a romantic premium design, smooth mobile experience, and emotional details.
```

ولو هتديه لـ AI code editor زي Cursor / Bolt / Lovable، أضف السطر ده فوق:

```text
Refactor the existing UI without breaking Supabase logic, routing, authentication, database queries, or environment variables. Focus only on improving styling, layout, responsiveness, components, and user experience.
```
       

       تمام، كده نعدّل الـfeatures والـinstructions: **كل Memory أو Event يقدر يشيل Photos و Videos** مش صور بس.

ضيف الجزء ده للـAI/developer instructions:

```text
Update the media system so that both Memories and Events can have media attachments.

Each Memory can include:
- multiple photos
- multiple videos
- optional cover photo/video
- media gallery inside memory details

Each Event can include:
- photos before or after the event
- videos related to the event
- optional event cover media
- media gallery inside event details

Supported media types:
- Images: JPG, PNG, WebP
- Videos: MP4, MOV, WebM

UI Requirements:
- On Add Memory and Add Event forms, add media upload section.
- Allow selecting multiple files.
- Show preview before upload.
- Show image thumbnails.
- Show video thumbnails or video player preview.
- Add remove button before saving.
- Show upload progress/loading state.
- Validate file size and type.
- Show friendly error messages if upload fails.
- In Memory/Event details page, show a clean media gallery.
- If media is video, show playable video with controls.
- If media is image, open it in a fullscreen preview/lightbox.
- The cards should show the first uploaded media as the cover.
- If there is no media, show a soft empty placeholder.

Storage Requirements:
- Use Supabase Storage.
- Keep bucket private.
- Store media paths in the database, not only public URLs.
- Generate signed URLs when displaying private media.
- Organize files by relationship and content type.

Suggested Storage Path:
relationship_id/memories/memory_id/file_name
relationship_id/events/event_id/file_name

Do not store videos directly in the database.
Only store file path, media type, file name, file size, and MIME type.

Performance:
- Compress images before upload when possible.
- Limit image size to 5MB.
- Limit video size in demo to 50MB maximum.
- Lazy load media in galleries.
- Do not autoplay videos.
```

## Database تعديل مهم

إحنا عندنا `memory_media` للـmemories فقط. الأحسن نخليها عامة:

### Option الأفضل: جدول واحد اسمه `media`

```sql
create table public.media (
    id uuid primary key default gen_random_uuid(),

    relationship_id uuid not null
        references public.relationships(id) on delete cascade,

    owner_type text not null
        check (owner_type in ('memory', 'event')),

    owner_id uuid not null,

    uploaded_by uuid not null
        references public.profiles(id) on delete cascade,

    file_path text not null,
    file_url text,

    media_type text not null
        check (media_type in ('image', 'video')),

    mime_type text,
    file_name text,
    file_size bigint,

    is_cover boolean not null default false,

    created_at timestamptz not null default now()
);
```

بدل ما يبقى عندنا:

* `memory_media`
* `event_media`

نخلي جدول واحد يخدم الاتنين.

## Storage Bucket

بدل `memory-photos`، الأفضل نسميه:

```text
ourspace-media
```

لأنه هيشيل memories + events + images + videos.

## Supabase Bucket Settings

```text
Bucket name: ourspace-media
Public: OFF
Max image size: 5MB
Max video size: 50MB for demo
Allowed MIME types:
image/jpeg
image/png
image/webp
video/mp4
video/quicktime
video/webm
```

## UI Text

بدل:

```text
Upload Photo
```

نخليها:

```text
Add Photos or Videos
```

وبدل:

```text
Memory Photos
```

نخليها:

```text
Memory Media
```

وبدل:

```text
Event Photos
```

نخليها:

```text
Event Media
```

## تعديل الـfeature list

```text
Memories:
- Add memory
- Attach multiple photos/videos
- Choose cover media
- View media gallery
- React to memory

Events:
- Add event
- Attach photos/videos
- View event gallery
- Mark event completed
- Add media after event
```

رأيي: للـdemo نخلي الفيديوهات شغالة، بس بحد أقصى 50MB عشان Supabase/Vercel والأداء. الصور تكون أساسية، والفيديوهات optional.
