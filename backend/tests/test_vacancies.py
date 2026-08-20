def _sample(id_: str, role: str = "Backend") -> dict:
    return {
        "id": id_,
        "url": "https://example.com/" + id_,
        "source_channel": "test",
        "title": f"Title {id_}",
        "company": "TestCo",
        "salary_min": None,
        "salary_max": None,
        "currency": None,
        "location": None,
        "remote": False,
        "category": "x",
        "stack": ["Python"],
        "apply_via": "test",
        "role": role,
        "language": "Python",
    }


def test_import_and_list_vacancies(client):
    resp = client.post("/vacancies/import", json=[_sample("test/1")])
    assert resp.status_code == 200
    assert resp.json() == {"imported": 1}

    resp = client.get("/vacancies/")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 1
    assert data[0]["title"] == "Title test/1"
    assert data[0]["stack"] == ["Python"]


def test_import_upserts_existing_id(client):
    client.post("/vacancies/import", json=[_sample("dup/1")])
    updated = _sample("dup/1")
    updated["title"] = "Changed title"
    client.post("/vacancies/import", json=[updated])

    resp = client.get("/vacancies/")
    data = resp.json()
    assert len(data) == 1
    assert data[0]["title"] == "Changed title"


def test_filter_by_role(client):
    client.post("/vacancies/import", json=[_sample("a", role="Backend"), _sample("b", role="Frontend")])
    resp = client.get("/vacancies/", params={"role": "Backend"})
    data = resp.json()
    assert len(data) == 1
    assert data[0]["id"] == "a"


def test_get_single_vacancy_with_slash_in_id(client):
    client.post("/vacancies/import", json=[_sample("proglib_jobs/1065")])
    resp = client.get("/vacancies/proglib_jobs/1065")
    assert resp.status_code == 200
    assert resp.json()["id"] == "proglib_jobs/1065"


def test_get_missing_vacancy_404(client):
    resp = client.get("/vacancies/does-not-exist")
    assert resp.status_code == 404
