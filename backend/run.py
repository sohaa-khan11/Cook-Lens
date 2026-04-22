import uvicorn

if __name__ == "__main__":
    """
    Run FastAPI server with hot-reload enabled 
    for rapid development of CookLens.
    """
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
