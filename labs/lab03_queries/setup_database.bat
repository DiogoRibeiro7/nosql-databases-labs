@echo off
setlocal enabledelayedexpansion
REM Setup script for lab03_movies database
REM Run this script in your terminal to import the data

pushd "%~dp0" >nul

echo Setting up lab03_movies database...

REM Helper to convert JSON arrays into newline-delimited JSON for mongoimport
set "IMPORT_ROOT=starter\data"
set "IMPORT_DIR=%IMPORT_ROOT%\mongoimport"
set "TMP_PY=%TEMP%\lab03_convert_%RANDOM%%RANDOM%.py"

echo Preparing NDJSON copies for mongoimport...
> "%TMP_PY%" echo import json
>> "%TMP_PY%" echo from pathlib import Path
>> "%TMP_PY%" echo root = Path(r"%IMPORT_ROOT:/=\%")
>> "%TMP_PY%" echo ndjson_dir = root / "mongoimport"
>> "%TMP_PY%" echo ndjson_dir.mkdir(exist_ok=True)
>> "%TMP_PY%" echo names = ["movies", "theaters", "users", "comments", "sessions"]
>> "%TMP_PY%" echo for name in names:
>> "%TMP_PY%" echo ^    src = root / f"{name}.json"
>> "%TMP_PY%" echo ^    dest = ndjson_dir / f"{name}.json"
>> "%TMP_PY%" echo ^    text = src.read_text(encoding="utf-8").strip()
>> "%TMP_PY%" echo ^    if not text:
>> "%TMP_PY%" echo ^        raise SystemExit(f"Source file {src} is empty")
>> "%TMP_PY%" echo ^    if text.startswith("["):
>> "%TMP_PY%" echo ^        docs = json.loads(text)
>> "%TMP_PY%" echo ^    else:
>> "%TMP_PY%" echo ^        docs = [json.loads(line) for line in text.splitlines() if line.strip()]
>> "%TMP_PY%" echo ^    with dest.open("w", encoding="utf-8") as out:
>> "%TMP_PY%" echo ^        for doc in docs:
>> "%TMP_PY%" echo ^            out.write(json.dumps(doc))
>> "%TMP_PY%" echo ^            out.write("\n")

python "%TMP_PY%"
if errorlevel 1 (
    del "%TMP_PY%" >nul 2>&1
    echo Failed to generate NDJSON files. Aborting.
    popd >nul
    exit /b 1
)
del "%TMP_PY%" >nul 2>&1

for %%C in (movies theaters users comments sessions) do (
    echo Importing %%C...
    mongoimport --drop --db lab03_movies --collection %%C --file "%IMPORT_DIR%\%%C.json" --type json >nul 2>&1
)

popd >nul

echo.
echo Database setup complete^!
echo To verify, run in mongosh:
echo   use lab03_movies
echo   db.movies.countDocuments()
echo   db.theaters.countDocuments()
echo   db.comments.countDocuments()
echo   db.sessions.countDocuments()
pause
