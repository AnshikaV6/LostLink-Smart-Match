# LostLink-Smart-Match

A responsive web app that helps people recover lost belongings by matching lost-item reports with found-item reports using a rule-based scoring algorithm.

> **Note:** This is a local browser prototype. It is not connected to a real college database, and all data stays in your browser.

## Features
- **Dashboard:** total lost items, found items and potential matches, plus recently reported items
- **Report lost and found items:** forms with validation and helpful error messages
- **Image upload with preview** (optional)
- **Smart matching engine:** compares lost and found reports and calculates a score from 0 to 100
- **Match explanations:** shows the reasons for each match, with matching and non-matching criteria
- **Match labels:** High potential match, Possible match, Low similarity
- **Search and category filters** on reports and matches
- **Item management:** view, edit, delete (with confirmation) and mark items as recovered
- **Sample data:** load fictional demo data and reset it at any time
- **Responsive design** for laptops and mobile phones

## How the matching works
Only lost reports are compared with found reports, and a report is never matched with itself. Each pair gets a weighted score from these criteria:

| Criteria | What is compared | Weight |
|---|---|---|
| Category | Same item category | [e.g., 25] |
| Item name | Similar words in the name | [e.g., 20] |
| Colour | Same or similar colour | [e.g., 15] |
| Description | Shared keywords | [e.g., 15] |
| Location | Similar place names | [e.g., 15] |
| Date | How close the lost and found dates are | [e.g., 10] |

The total is converted into a label:
- **High potential match:** [e.g., 70 and above]
- **Possible match:** [e.g., 40 to 69]
- **Low similarity:** [below 40]

The score only shows how similar two reports are. It is **not proof of ownership**, and the app does not verify owners automatically.

## Privacy and safety
- Contact information is optional and not displayed publicly
- No sensitive details from identity cards are shown
- All sample data is fictional
- Data is stored only in your browser's localStorage

## Tech stack
- **HTML5:** semantic structure and accessible form labels
- **CSS3:** responsive layout, cards, animations
- **JavaScript (vanilla):** matching algorithm, form validation, DOM updates
- **Browser localStorage:** saving reports
- No backend, no external libraries, no paid or AI APIs

## Project structure

    LostLink-Smart-Match/
    ├── index.html
    ├── style.css
    └── script.js

## How to run
1. Download or clone the repository:

       git clone https://github.com/yourusername/lostlink-smart-match.git

2. Open the project folder.
3. Double-click `index.html` to open it in your browser (Chrome, Edge or Firefox).
4. Click **Load Sample Data** to try the app with demo reports.

## How to test
1. Load the sample data and check that the dashboard counts update.
2. Report a new lost item, then a similar found item, and see the match appear.
3. Open a match to see the score and the reasons for it.
4. Use the search bar and category filters.
5. Edit a report, mark one as recovered, and delete one (confirm the prompt).
6. Refresh the page to confirm the data is still saved.
7. Resize the window to check the mobile layout.

## Development note
Built with AI-assisted development (GitHub Copilot). I wrote the project requirements and matching criteria, tested the app, and reviewed the generated code.

## Limitations
- Data is stored only in one browser, so it is not shared between users or devices
- Matching uses text, colour and date comparison. It does not analyse the uploaded images
- Contact details are not used to notify anyone, since there is no backend

## Future improvements
- Add a backend and database so multiple users can share reports
- Compare images using image recognition
- Send email or SMS notifications for strong matches
- Add an owner verification step before an item is returned
- Add an admin dashboard

## Author
Anshika | Computer Science and Engineering student
