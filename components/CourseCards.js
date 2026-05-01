function courseLinkProps(course) {
  const props = {
    href: course.href
  };

  if (course.external !== false) {
    props.target = "_blank";
    props.rel = "noreferrer";
  }

  return props;
}

export function CourseGrid({ courses = [] }) {
  const activeCourses = courses.filter((course) => course.active !== false);

  return (
    <div className="course-grid">
      {activeCourses.map((course) => (
        <a key={course.id} className="course-card" {...courseLinkProps(course)}>
          <span className="card-tag">{course.tag}</span>
          <h3>{course.title}</h3>
          <p>{course.summary}</p>
        </a>
      ))}
    </div>
  );
}

export function createCourseGridHtml(courses = []) {
  const courseCards = courses
    .filter((course) => course.active !== false)
    .map(createCourseCardHtml)
    .join("");

  return `<div class="course-grid">${courseCards}</div>`;
}

function createCourseCardHtml(course) {
  const externalAttrs = course.external === false ? "" : ' target="_blank" rel="noreferrer"';

  return `<a class="course-card" href="${escapeHtmlAttribute(course.href)}"${externalAttrs}><span class="card-tag">${escapeHtml(course.tag)}</span><h3>${escapeHtml(course.title)}</h3><p>${escapeHtml(course.summary)}</p></a>`;
}

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeHtmlAttribute(value = "") {
  return escapeHtml(value);
}
