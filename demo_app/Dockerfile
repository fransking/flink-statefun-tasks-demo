from python:3.10-slim

RUN mkdir /app

COPY requirements.txt /app
RUN pip install -r /app/requirements.txt

COPY py_files/ /app/py_files/
COPY website/ /app/website/

WORKDIR /app

EXPOSE 8082

COPY entrypoint.sh /app

ENTRYPOINT ["/app/entrypoint.sh"]
CMD ["gunicorn"]
