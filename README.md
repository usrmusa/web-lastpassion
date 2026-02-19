# Last Passion

Official store for Last Passion.

## Development

1.  Copy `.env.example` to `.env`
2.  Fill in your Firebase configuration values in `.env`
3.  Install dependencies:
    ```bash
    npm install
    ```
4.  Run the development server:
    ```bash
    npm run dev
    ```

## Deployment

This project is deployed to GitHub Pages using GitHub Actions.

1.  Go to your repository settings on GitHub.
2.  Navigate to **Secrets and variables** > **Actions**.
3.  Add the following repository secrets:
    *   `VITE_FIREBASE_API_KEY`
    *   `VITE_FIREBASE_AUTH_DOMAIN`
    *   `VITE_FIREBASE_PROJECT_ID`
    *   `VITE_FIREBASE_STORAGE_BUCKET`
    *   `VITE_FIREBASE_MESSAGING_SENDER_ID`
    *   `VITE_FIREBASE_APP_ID`
    *   `VITE_FIREBASE_MEASUREMENT_ID`
4.  Ensure GitHub Pages source is set to **GitHub Actions**.

## Security

*   **Never commit `.env` files.**
*   Use `git filter-repo` to remove any accidentally committed secrets from history.

### Removing Secrets from History

If you have accidentally committed secrets, you must remove them from the Git history.

1.  **Install `git-filter-repo`**:
    ```bash
    pip install git-filter-repo
    ```
    (Requires Python)

2.  **Create a `replace.txt` file**:
    ```text
    AIzaSyBeu9X992zDkl60XSMARkcdxu2nACzAO_w==>REMOVED_SECRET
    ```
    (Replace the left side with the *actual* leaked key you want to scrub)

3.  **Run the filter command**:
    ```bash
    git filter-repo --replace-text replace.txt --force
    ```

4.  **Force push the changes**:
    ```bash
    git push origin --force --all
    git push origin --force --tags
    ```
