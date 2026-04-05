# MLflow UI

- Its a web based dashboard
- It helps in visually tracking and managing the ML experiments
- It helps in:
  - Comparing the experiment runs
  - View logged parameters
  - See metrics (accuracy, loss, etc.)
  - Download artifacts (models, plots, files)
  - Register and manage models
- Use the below command to run the MLflow UI. 


## Launching the UI

- To view your experiments and runs in a web interface, run:

```bash
mlflow ui
```

- By default, this starts a local server (usually at `http://127.0.0.1:5000`).
- Open this URL in your browser to access the UI.

---

## Main sections

| Section | Purpose |
|---------|---------|
| **Experiments** | All experiments and their runs; compare parameters, metrics, and artifacts. Each experiment contains multiple runs.  |
| **Models** | Registered models from the Model Registry (versions, stages, metadata) |
| **Prompts** | Manage and compare prompt templates (for LLM workflows) |
| **AI Gateway** | Centralized routing and management for AI/LLM endpoints |


---


## Common tasks

- **Compare runs** – Select multiple runs and click **Compare** to view metrics, parameters, and differences side by side
- **View run details** – Click a run to see its full metadata, logged artifacts, and model info
- **Download artifacts** – Open a run and download models, plots, or other logged files
