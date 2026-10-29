FROM python:3.11-slim
WORKDIR /app
COPY lani_llm_matcher ./lani_llm_matcher
ENV PYTHONUNBUFFERED=1
USER 65534:65534
EXPOSE 8090
ENTRYPOINT ["python", "-m", "lani_llm_matcher.worker"]
CMD ["--http", "--host", "0.0.0.0", "--port", "8090"]
