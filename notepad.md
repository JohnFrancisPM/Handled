# Things I want you to do

## What I want to do:
- I am working on the capstone project for my AI class.
- I want to build out the following items as 3 separate web apps:
    - The Handled public facing website
    - The Handled customer experience
        - Building out the Handled customer experience will include the front end and a backend that uses n8n and supabase.
    - A test harness to show how the system responds to inbound requests
- I will be presenting this in a 3 minute recorded demo.
- `dev-os/README.md` provides instructions on how to build apps.
- In the recorded demo I want to present the following:
    - The product I built (Handled) by showing off the website.
    - I will walk through the customer experience
    - Briefly talk throught the n8n flow (architecture) and explain the reasons behind my architure.
    - Show the test harness and send a few prompts.
    - Go through the eval process by exporting the AI responses to Azure foundry and using Azure's evaluator schema.
- Let's work through building each web app.

## Handled company website
- Build the Handled company website based on competitor websites. 
- Fill in different parts of the websites. 
- Use competitor pricing for handled's pricing and place it in the premium tier of pricing.
- Include a differentiator page (i.e. why choose us/why we are better) that outlines the things you already identified: differentiation is workflow depth, deep field-service-management integration (books real jobs into Jobber/Housecall Pro/ServiceTitan), office-manager scope (missed-call text-back, quote follow-up, reviews), and trade-aware emergency triage.

## Handled customer experience
- Build the Handed customer experience
    - Backend tech stack:
        - Assume I will use Supabase for the database and use it to store:
            - Handled's customer profile
            - Memory for all conversations AI has with customer's of Handled's customers.
            - This memory will be used to eval the AI agents.
        - n8n will serve as the agentic workflow.  
            - It will have a webhook where messages can be posted that is the entry point for a AI agentic flow and it will return a response.
            - Determine the best way to setup the agentic flow in n8n, I would assume we have a multi-agent flow that has a intent router at the front and then subsequent agents that handle different types of scenarios.
            - For each agent that needs to be setup in n8n, create the prompt I can use.
    - Fill in necessary features of the Handled customer experience: dashboard, incoming messages and their responses, show how many inbound requests converted to closed appointments the price of each.
    - Ensure the handled customer experience enables self service of the customer profile and policies setup. There is an example customer profile below.

## Example Customer of Handled:
- Customer Profile
    - Name: Acme Plumbing
    - Residential Plumbing company that is located in Queens, NY (11375). 
    - Service Locations:
        - Will service Queens, Brooklyn, Manhattan, Nassau County.
        - Won't service, bronx, weschester, and further upstate as well as new jersey and suffolk county
    - Employees:
        - 5 employees plus owner.
        - 1 employee is sick today and 1 is on vacation for the week.
    - Who They Service: 
        Single-family homeowners, renters, landlords, and residential property managers.   
    - Core Services Provided:
        - Drain clearing and clog removal. 
        - Household fixture installation and repair (sinks, toilets, faucets, showers, garbage disposals).
        - Residential water heater installation, maintenance, and repair (tank and tankless)
        - Household leak detection and pipe repairs (PEX, copper, PVC).
        - Sump pump installation and maintenance
        - Radiant floor heating system installation, hydronic boiler maintenance, gas line installation for appliances/generators, and gas leak repair.
    - Who they won't service:
        - Retail stores, office buildings, restaurants, multi-family apartment complexes, schools, hotels, and healthcare facilities.
        - Manufacturing plants, chemical processing facilities, refineries, power generation plants, and food processing facilities.
        - General contractors, real estate developers, homebuilders, and commercial construction managers.
        - Rapid response for main sewer backups, burst pipes, major leaks, main shutoff valve failures, and emergency water heater replacements.
    - Services They Will Not Provided:   
        - High-occupancy waste removal and heavy-use fixture maintenance.
        - Commercial boiler and large-capacity water heating systems.
        - Grease trap installation, interceptor servicing, and restaurant code compliance.
        - Backflow preventer testing, maintenance, and certification.
        - Multi-story water pressure regulation and vertical drainage management.
        - High-pressure steam, compressed air, and process fluid piping systems.
        - Chemical-resistant and hazardous material containment piping.
        - Specialized pipe welding (carbon steel, stainless steel, alloy piping).
        - System installation adhering to strict industrial regulatory standards (ASME, OSHA, EPA).
        - Blueprint design, code compliance planning, and system architecture.
        - Underground utility connection and rough-in piping installation.
        - Water supply and main sewer tie-ins.
        - Finish plumbing (installing fixtures and testing lines before building handover).
        - Cured-in-place pipe (CIPP) lining, pipe bursting, hydro-jetting, camera pipe inspections, and deep sewer excavation.
        - Dealing with failing subterranean sewer or main water lines
        - Whole-building water softeners, reverse osmosis systems, UV purification, sediment filtration, and municipal/well water testing
    - Info collected from Acme Plumbing's customers
        - Assume interactions are done using SMS messaging so you should have the phone number of the Acme's customer which can be used the customer ID.
        - Customers should be asked to provide names and addresses as well which is stored against their customer profile.
        - When sending information to the AI agent in n8n, the following should be provided as context.
            - Phone #.
            - Name (if previously provided and stored)
            - Address (if previously provided and stored)
            - Chat History
            - Previous jobs done with details and prices.
- Research and create pricing for each of the services for this customer.
- Backfill 30 customers of this company, including message logs, appointments booked and prices for each.
- The backfill of 30 customers should different types of interactions, use evals.xlsx for insights.

## Test Harness
- I need a test harness web app that operates completely separately that allows me to impersonate multiple users, view their chat history and send messages as them and see the AI's response.
- The test harness should mimic SMS messaging so it looks like a user is texting Acme Plumbing.
- I will use this to actually test out the flow.
- Use the 30 customers backfilled into the example customer above to load up the test harness 

# Evaluations
- The current evals assume a phone conversation but for this exercise I want to focus on text inputs only
- Since the chat history will be saved in supabase and uploaded to azure for evaluation of the AI agent I need the conversations with the following fields:
    - question
    - response
    - citation
    - reasoning