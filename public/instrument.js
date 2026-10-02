// Request stages are event-driven. There are no timers or invented percentages.
export function analysisPhase(phase, message) {
  const pipeline = document.getElementById("analysis-pipeline");
  if (!pipeline) return;
  pipeline.dataset.phase = phase;
  document.getElementById("pipeline-state").textContent = message;
}
