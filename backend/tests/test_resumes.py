import io


def test_upload_rename_download_delete_resume(client):
    file_content = b"%PDF-1.4 fake content"
    resp = client.post(
        "/resumes/",
        files={"file": ("test-resume.pdf", io.BytesIO(file_content), "application/pdf")},
    )
    assert resp.status_code == 200
    resume = resp.json()
    assert resume["name"] == "test-resume"
    assert resume["file_name"] == "test-resume.pdf"
    assert resume["size"] == len(file_content)
    resume_id = resume["id"]

    resp = client.get("/resumes/")
    assert len(resp.json()) == 1

    resp = client.patch(f"/resumes/{resume_id}", data={"name": "My Backend CV"})
    assert resp.status_code == 200
    assert resp.json()["name"] == "My Backend CV"

    resp = client.get(f"/resumes/{resume_id}/download")
    assert resp.status_code == 200
    assert resp.content == file_content

    resp = client.delete(f"/resumes/{resume_id}")
    assert resp.status_code == 200
    resp = client.get("/resumes/")
    assert len(resp.json()) == 0


def test_rename_ignores_blank_name(client):
    resp = client.post("/resumes/", files={"file": ("r.pdf", io.BytesIO(b"%PDF"), "application/pdf")})
    resume_id = resp.json()["id"]

    resp = client.patch(f"/resumes/{resume_id}", data={"name": "   "})
    assert resp.status_code == 200
    assert resp.json()["name"] == "r"  # unchanged, blank rename is a no-op


def test_reject_bad_extension(client):
    resp = client.post("/resumes/", files={"file": ("resume.txt", io.BytesIO(b"hi"), "text/plain")})
    assert resp.status_code == 400


def test_reject_too_large(client):
    big = b"x" * (5 * 1024 * 1024 + 1)
    resp = client.post("/resumes/", files={"file": ("big.pdf", io.BytesIO(big), "application/pdf")})
    assert resp.status_code == 400


def test_download_missing_resume_404(client):
    resp = client.get("/resumes/does-not-exist/download")
    assert resp.status_code == 404


def test_rename_missing_resume_404(client):
    resp = client.patch("/resumes/does-not-exist", data={"name": "x"})
    assert resp.status_code == 404
