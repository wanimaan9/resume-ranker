function generateHTML(data) {
  const hasExperience = data.experience && data.experience.length > 0;
  
  return `
  <html>
  <head>
    <style>
      body {
        font-family: 'Times New Roman', Times, serif;
        margin: 0;
        padding: 40px;
        background: white;
        color: black;
        line-height: 1.3;
      }
      .header {
        text-align: center;
        margin-bottom: 20px;
      }
      .name {
        font-size: 28px;
        font-weight: bold;
        text-transform: uppercase;
        letter-spacing: 1px;
        margin: 0 0 5px 0;
      }
      .contact-info {
        font-size: 14px;
        margin: 0;
      }
      .section {
        margin-bottom: 15px;
      }
      .section-title {
        font-size: 16px;
        font-weight: bold;
        text-transform: uppercase;
        margin: 0 0 5px 0;
        border-bottom: 1px solid black;
        padding-bottom: 2px;
      }
      .content {
        margin-top: 5px;
      }
      .summary {
        text-align: justify;
        font-size: 14px;
      }
      ul {
        margin: 5px 0 0 0;
        padding-left: 20px;
      }
      li {
        font-size: 14px;
        margin-bottom: 3px;
      }
      .item {
        margin-bottom: 10px;
      }
      .item-header {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
      }
      .item-title {
        font-size: 14px;
        font-weight: bold;
        margin: 0;
      }
      .item-date {
        font-size: 14px;
        margin: 0;
      }
      .item-subtitle {
        font-size: 14px;
        font-style: italic;
        margin: 2px 0;
      }
      .item-desc {
        font-size: 14px;
        margin: 4px 0 0 0;
        text-align: justify;
      }
      .skills-list {
        font-size: 14px;
        margin: 5px 0 0 0;
      }
    </style>
  </head>
  <body>
    <div class="header">
      <h1 class="name">${data.name || "Your Name"}</h1>
      ${data.role ? `<div class="contact-info">${data.role}</div>` : ""}
    </div>

    ${data.summary ? `
    <div class="section">
      <h2 class="section-title">Objective</h2>
      <div class="summary">${data.summary}</div>
    </div>` : ''}

    <div class="section">
      <h2 class="section-title">Skills</h2>
      <div class="skills-list">
        ${(data.skills || []).join(", ")}
      </div>
    </div>

    ${hasExperience ? `
    <div class="section">
      <h2 class="section-title">Work Experience</h2>
      ${data.experience.map(e => `
        <div class="item">
          <div class="item-header">
            <p class="item-title">${e.title || ""}</p>
            <p class="item-date">${e.duration || ""}</p>
          </div>
          ${e.company ? `<p class="item-subtitle">${e.company}</p>` : ''}
          <div class="item-desc">${e.description || ""}</div>
        </div>
      `).join("")}
    </div>` : ''}

    ${data.projects && data.projects.length > 0 ? `
    <div class="section">
      <h2 class="section-title">Projects</h2>
      ${data.projects.map(p => `
        <div class="item">
          <div class="item-header">
            <p class="item-title">${p.title || ""}</p>
          </div>
          <div class="item-desc">${p.description || ""}</div>
        </div>
      `).join("")}
    </div>` : ''}

  </body>
  </html>
  `;
}

module.exports = { generateHTML };
