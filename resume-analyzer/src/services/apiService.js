const API_BASE_URL = 'https://ai-resume-analyzer-4j57.onrender.com';

export const uploadResume = async (file) => {
  const formData = new FormData();
  formData.append('resume', file);

  const res = await fetch(`${API_BASE_URL}/upload`, {
    method: 'POST',
    body: formData
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.error || "An error occurred on the server.");
  }

  return await res.json();
};

export const downloadPDF = async (result) => {
  const res = await fetch(`${API_BASE_URL}/downloadResume`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ data: result })
  });

  if (!res.ok) {
    throw new Error("Failed to generate PDF");
  }

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "improved_resume.pdf";
  link.click();
  window.URL.revokeObjectURL(url);
};
