# Firebase Migration Guide (Users & Database)

Since the source and destination projects are on **different Google accounts**, you cannot access both simultaneously with a single login. You must perform the migration in two distinct stages: **Export** (using the old account) and **Import** (using the new account).

## Prerequisites

1.  **Firebase CLI:** Install the Firebase CLI globally if you haven't already:
    ```bash
    npm install -g firebase-tools
    ```
2.  **Google Cloud SDK (gcloud):** Required for Firestore export/import. [Install here](https://cloud.google.com/sdk/docs/install).

---

## Phase 1: Export from Old Account

1.  **Logout of any existing session:**
    ```bash
    firebase logout
    gcloud auth revoke --all
    ```

2.  **Login with the OLD Google Account:**
    This is the account that owns `digilayn-core-app`.
    ```bash
    firebase login
    gcloud auth login
    ```

3.  **Export Users:**
    Run the following command to export the users to a JSON file.
    ```bash
    firebase auth:export users.json --format=json --project digilayn-core-app
    ```

4.  **Export Firestore Database:**
    Firestore data must be exported to a Google Cloud Storage bucket.
    
    *   **Create a temporary bucket** in the old project (or use an existing one):
        ```bash
        gsutil mb -p digilayn-core-app gs://digilayn-core-app-export
        ```
    *   **Export Firestore data to the bucket:**
        ```bash
        gcloud firestore export gs://digilayn-core-app-export/my-export --project=digilayn-core-app
        ```
    *   **Download the export to your local machine:**
        ```bash
        gsutil -m cp -r gs://digilayn-core-app-export/my-export .
        ```
        *This creates a folder named `my-export` in your current directory.*

---

## Phase 2: Import to New Account

1.  **Logout of the old account:**
    ```bash
    firebase logout
    gcloud auth revoke --all
    ```

2.  **Login with the NEW Google Account:**
    This is the account that owns `digilayn-projects`.
    ```bash
    firebase login
    gcloud auth login
    ```

3.  **Import Users:**
    Run the import command using the parameters you provided.

    ```bash
    firebase auth:import users.json \
        --hash-algo=SCRYPT \
        --hash-key=ReN4FWISf7T9cwWfNCnQjDpxV43qqMK+VCGBNGJHl6+8EuBjYmE9GdqiqaQy69BRCq7ZtG64xEsxNjH0NYxByA== \
        --salt-separator=Bw== \
        --rounds=8 \
        --mem-cost=14 \
        --project digilayn-projects
    ```

4.  **Import Firestore Database:**
    You need to upload the data to a bucket in the new project and then import it.

    *   **Create a bucket in the new project:**
        ```bash
        gsutil mb -p digilayn-projects gs://digilayn-projects-import
        ```
    *   **Upload the export folder:**
        ```bash
        gsutil -m cp -r my-export gs://digilayn-projects-import/
        ```
    *   **Import into Firestore:**
        ```bash
        gcloud firestore import gs://digilayn-projects-import/my-export --project=digilayn-projects
        ```

---

## Phase 3: Finalize

1.  **Enable Authentication:**
    *   Go to the [Firebase Console](https://console.firebase.google.com/) (logged in as the **NEW** account).
    *   Select project `digilayn-projects`.
    *   Navigate to **Authentication** > **Sign-in method**.
    *   Ensure **Email/Password** is enabled.

2.  **Verify:**
    *   Check **Authentication** > **Users** to see if users exist.
    *   Check **Firestore Database** to see if your collections (`lastpassion`, `users`, etc.) are populated.
