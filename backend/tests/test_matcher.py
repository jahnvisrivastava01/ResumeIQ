from utils.matcher import analyze_resume, extract_skills


def test_extracts_common_full_stack_skills():
    skills = extract_skills("Built with React.js, Node.js, Express, MongoDB, JavaScript and REST APIs")
    assert "react" in skills
    assert "node.js" in skills
    assert "express.js" in skills
    assert "mongodb" in skills
    assert "javascript" in skills


def test_custom_job_description_finds_a_gap():
    resume = "Built React and Node.js applications using Express, MongoDB, JavaScript, SQL, Git and REST APIs."
    job = "Full Stack Developer needed with React, Node.js, Express, MongoDB, JavaScript, SQL, Git, REST API and Docker."
    result = analyze_resume(resume, "full stack developer", job)
    assert result["analysis_mode"] == "job_description"
    assert result["match_score"] >= 50
    assert "docker" in result["missing_skills"]
    assert "react" in result["found_skills"]
    assert "formula" in result["score_breakdown"]


def test_role_template_analysis():
    result = analyze_resume("Python FastAPI SQL REST API Git and OOP experience. Built backend APIs.", "python developer")
    assert result["analysis_mode"] == "role_template"
    assert 0 <= result["match_score"] <= 100
    assert isinstance(result["suggestions"], list)
