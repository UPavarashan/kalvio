import {
  GPA_TREND,
  UPCOMING_TASKS,
  STUDY_MATERIALS,
  DASHBOARD_WEEKLY_COURSES,
} from "../data/mockData";

export default function Dashboard() {
  const maxGpa = 4.0;

  return (
    <div className="space-y-8 sm:space-y-10">
      <section>
        <h2 className="font-headline text-2xl sm:text-3xl font-semibold text-primary ink-underline inline-block">
          Good Morning
        </h2>
        <p className="font-body text-base sm:text-lg text-on-surface-variant mt-4 max-w-xl">
          One step at a time, one page at a time. Your journey is uniquely yours.
        </p>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="paper-texture hand-drawn-border charcoal-shadow-lg p-6 bg-surface-container">
          <p className="font-label text-xs text-on-surface-variant mb-2">
            CURRENT GPA
          </p>
          <div className="flex items-end gap-4">
            <span className="font-display text-5xl sm:text-6xl font-bold text-primary leading-none">
              0.00
            </span>
          </div>
          <div className="h-40 flex items-end justify-around gap-2 mt-6 border-b-2 border-primary border-l-2 px-4">
            {GPA_TREND.map((sem) => (
              <div key={sem.label} className="flex flex-col items-center w-full max-w-[48px]">
                <div
                  className={`w-full sketch-bar ${
                    sem.projected ? "bg-primary" : "bg-primary-fixed-dim"
                  }`}
                  style={{ height: `${(sem.gpa / maxGpa) * 120}px` }}
                />
                <p className="font-label text-[10px] mt-2">{sem.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="paper-texture hand-drawn-border charcoal-shadow-lg p-6 bg-surface-container">
          <p className="font-label text-xs text-on-surface-variant mb-4">
            WEEKLY ATTENDANCE
          </p>
          <div className="flex items-center gap-8">
            <div className="relative w-28 h-28 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <circle
                  cx="18"
                  cy="18"
                  r="15.9"
                  fill="none"
                  stroke="#e4e2de"
                  strokeWidth="3"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="15.9"
                  fill="none"
                  stroke="#4a635d"
                  strokeWidth="3"
                  strokeDasharray="0, 100"
                />
              </svg>
              <span className="absolute font-display text-2xl font-bold text-primary">
                0%
              </span>
            </div>
            <div className="flex-grow space-y-4">
              {DASHBOARD_WEEKLY_COURSES.map((course) => (
                <div key={course.name}>
                  <div className="flex justify-between font-label text-[10px] mb-1">
                    <span>{course.name}</span>
                    <span>
                      {course.present}/{course.total} Classes
                    </span>
                  </div>
                  <div className="h-2 bg-surface hand-drawn-border overflow-hidden">
                    <div
                      className="h-full bg-primary-container sketch-bar"
                      style={{ width: `${(course.present / course.total) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-headline text-2xl font-medium text-primary">
            Upcoming Tasks
          </h3>
          <button
            type="button"
            className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary hand-drawn-border font-label text-xs charcoal-shadow hover:translate-y-0.5 transition-transform"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            New Task
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {UPCOMING_TASKS.map((task) => (
            <div
              key={task.id}
              className={`paper-texture hand-drawn-border p-4 charcoal-shadow hover:-translate-y-1 transition-transform ${
                task.highlight ? "bg-primary-fixed" : "bg-surface-bright"
              }`}
            >
              <span
                className={`font-label text-[10px] px-2 py-1 rounded ${task.tagStyle}`}
              >
                {task.tag}
              </span>
              <h4 className="font-headline text-lg font-medium mt-3 mb-2">
                {task.title}
              </h4>
              <p className="font-body text-sm text-on-surface-variant mb-3">
                {task.description}
              </p>
              <p className="font-label text-[10px] text-on-surface-variant">
                {task.date}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-16">
        <div className="p-6 bg-surface-container-high hand-drawn-border charcoal-shadow border-dashed min-h-[200px] flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-surface-container transition-colors">
          <span className="material-symbols-outlined text-4xl text-primary">
            draw
          </span>
          <p className="font-body text-on-surface-variant">
            Click to start a freehand note...
          </p>
        </div>

        <div className="paper-texture hand-drawn-border charcoal-shadow p-6 bg-surface-container">
          <h3 className="font-headline text-xl font-medium text-primary mb-4">
            Recent Study Materials
          </h3>
          <div className="space-y-3">
            {STUDY_MATERIALS.map((file) => (
              <div
                key={file.name}
                className="flex items-center gap-4 p-3 bg-surface-bright hand-drawn-border hover:bg-surface-variant transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-primary">
                  {file.icon}
                </span>
                <div className="flex-grow">
                  <p className="font-label text-xs">{file.name}</p>
                  <p className="text-[10px] text-on-surface-variant">{file.size}</p>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant text-sm">
                  download
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
