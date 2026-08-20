import io


def _make_vacancy(client, vacancy_id="v1"):
    client.post(
        "/vacancies/import",
        json=[
            {
                "id": vacancy_id,
                "url": "u",
                "source_channel": "s",
                "title": "T",
                "company": "C",
                "salary_min": None,
                "salary_max": None,
                "currency": None,
                "location": None,
                "remote": False,
                "category": "x",
                "stack": None,
                "apply_via": "x",
                "role": "Backend",
                "language": None,
            }
        ],
    )


def _make_resume(client) -> str:
    resp = client.post("/resumes/", files={"file": ("r.pdf", io.BytesIO(b"%PDF"), "application/pdf")})
    return resp.json()["id"]


def test_create_application_defaults_to_draft(client):
    _make_vacancy(client)
    resume_id = _make_resume(client)

    resp = client.post("/applications/", json={"vacancy_id": "v1", "resume_id": resume_id})
    assert resp.status_code == 200
    application = resp.json()
    assert application["status"] == "draft"
    assert application["vacancy_id"] == "v1"
    assert application["resume_id"] == resume_id


def test_update_status_and_filter(client):
    _make_vacancy(client, "v2")
    resume_id = _make_resume(client)
    app_id = client.post("/applications/", json={"vacancy_id": "v2", "resume_id": resume_id}).json()["id"]

    resp = client.patch(f"/applications/{app_id}/status", json={"status": "applied"})
    assert resp.status_code == 200
    assert resp.json()["status"] == "applied"

    resp = client.get("/applications/", params={"status": "applied"})
    assert len(resp.json()) == 1

    resp = client.get("/applications/", params={"status": "offer"})
    assert len(resp.json()) == 0


def test_create_application_missing_vacancy_404(client):
    resume_id = _make_resume(client)
    resp = client.post("/applications/", json={"vacancy_id": "nope", "resume_id": resume_id})
    assert resp.status_code == 404


def test_create_application_missing_resume_404(client):
    _make_vacancy(client, "v3")
    resp = client.post("/applications/", json={"vacancy_id": "v3", "resume_id": "nope"})
    assert resp.status_code == 404


def test_delete_application(client):
    _make_vacancy(client, "v4")
    resume_id = _make_resume(client)
    app_id = client.post("/applications/", json={"vacancy_id": "v4", "resume_id": resume_id}).json()["id"]

    resp = client.delete(f"/applications/{app_id}")
    assert resp.status_code == 200
    assert client.get("/applications/").json() == []


def test_update_status_missing_application_404(client):
    resp = client.patch("/applications/does-not-exist/status", json={"status": "applied"})
    assert resp.status_code == 404
