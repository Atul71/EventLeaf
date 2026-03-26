# EVENT LEAF

# Team Members

## Frontend
Shane George Thomas  
Atul Arun  

## Backend
Vivek Chenganassery  
Pritika Kannapiran  

We have completed the following CR for this sprint.
# User Stories

## Backend (API)
Vivek Chenganassery  
API: Integrate Google Calendar API Service - 5 story points

Pritika Kannapiran  
API: Fetch Event Impact Metrics - 2 story points
<BR>API: Search using Green Priority - 5 Story points


## Frontend (UI)
Atul Arun 
<BR> UI: Event Detail View with Green Certs - 5 story points
Design a detailed event landing page that highlights the "why" behind the green badge, showing the venue's eco-certifications to the user.
<BR>UI: Discovery Feed with Sustainability Filters - 5 story point
User Story
As an eco-conscious attendee,
I want to easily find events based on their environmental impact and venue certifications,
So that I can prioritize attending events that align with my sustainability values without a tedious manual search. 

Shane George Thomas  
UI: User Profile & "Impact History" - 5 story points 
User Story
As an eco-conscious attendee,
I want to view a calculated summary of the environmental resources saved by my participation (like paper and carbon),
So that I feel validated in my choice to support sustainable events and can track my personal contribution over time.

<BR>UI: Event Creation Wizard - 5 story points 
User Story
As an event organizer,
I want to follow a guided, step-by-step process to set up my event,
So that I can easily select green-certified venues and explicitly define the sustainability initiatives that will earn my event an "Eco-Friendly" badge.



# What issues your team planned to address?

This sprint aligned with the user stories above. The **backend** team planned to integrate the **Google Calendar API**, expose **event impact metrics**, and implement **search with a green-priority** focus so sustainability-related queries are first-class. The **frontend** team planned an **event detail view** that explains the green badge and surfaces venue **eco-certifications**, a **discovery feed** with **sustainability filters** for eco-conscious attendees, **profile and impact history** so users can see resources saved through their participation, and an **event creation wizard** for organizers to pick green venues and define initiatives for an eco-friendly badge. Each item was intended to be reviewed by another member of the same team (frontend or backend).

# Unit test - Frontend
This Cypress e2e test stubs the backend event APIs so the UI always gets a known list of 3 events, then it visits /events and checks that all 3 “View Event” links are rendered; after that, it switches the Date dropdown to next7 and verifies the list shrinks to 2 events, then it uses the search bar (aria-label="Search Events") to search for “tomorrow land” and verifies only 1 event remains; finally, it clicks the first “View Event” and asserts that the “Back” link exists and navigates back to /events

# Unit test - Backend
 
BuildEventICS (happy path: produces a valid ICS envelope, includes UID/title/location)
BuildEventICS when event is nil (expects error)
BuildEventICS default timezone behavior (when timezone is empty)
eventStartEndInZone (start/end parsing)
escapeICSText (ICs escaping like ; and , and newline handling)

Description
Built the functionality that provides paperless scheduling via a downloadable iCalendar file at GET /api/v1/events/:id/calendar.ics (optionally syncing published events to Google Calendar if configured). Added supporting DB mapping, and unit tests.

# Which ones were successfully completed?

All planned features for Sprint 2 were successfully completed.


# Which ones didn’t and why?

# Backend readme


# Links to YouTube videos

Integrated Video - 

Link to the board
[https://github.com/users/Atul71/projects/5](https://github.com/users/Atul71/projects/5)
