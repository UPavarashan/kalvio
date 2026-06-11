import { SKILL_ROADMAP } from "../data/mockData";
import UnderDevelopmentOverlay from "../components/UnderDevelopmentOverlay";

export default function SkillRoadmap() {
  return (
    <UnderDevelopmentOverlay>
    <div className="space-y-8 pb-16">
      <section>
        <h2 className="font-headline text-2xl sm:text-3xl font-semibold text-primary ink-underline inline-block">
          Skill Roadmap
        </h2>
        <p className="font-body text-on-surface-variant mt-4 max-w-xl">
          Track your learning journey and build the skills you need for your career goals.
        </p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {SKILL_ROADMAP.map((roadmap) => (
          <div
            key={roadmap.id}
            className="paper-texture hand-drawn-border p-6 bg-surface-container charcoal-shadow hover:-translate-y-1 transition-transform"
          >
            <div className="flex justify-between items-start mb-4">
              <h4 className="font-headline text-xl font-medium text-primary">
                {roadmap.title}
              </h4>
              <span className="font-label text-[10px] px-2 py-1 bg-primary-fixed text-primary rounded">
                {roadmap.status}
              </span>
            </div>

            <div className="mb-4">
              <div className="flex justify-between font-label text-xs mb-2">
                <span>Progress</span>
                <span>{roadmap.progress}%</span>
              </div>
              <div className="h-4 bg-surface hand-drawn-border overflow-hidden">
                <div
                  className="h-full bg-primary-container sketch-bar transition-all duration-500"
                  style={{ width: `${roadmap.progress}%` }}
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {roadmap.skills.map((skill) => (
                <span
                  key={skill}
                  className="font-label text-[10px] px-3 py-1 bg-surface-bright hand-drawn-border text-on-surface-variant"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className="paper-texture hand-drawn-border charcoal-shadow p-10 bg-surface-container-high text-center">
        <span className="material-symbols-outlined text-5xl text-primary mb-4">
          route
        </span>
        <h3 className="font-headline text-2xl font-medium text-primary mb-2">
          Build Your Custom Path
        </h3>
        <p className="font-body text-on-surface-variant mb-6 max-w-md mx-auto">
          Create a personalized learning roadmap tailored to your career aspirations.
        </p>
        <button
          type="button"
          className="px-6 py-3 bg-primary text-on-primary hand-drawn-border font-label text-xs charcoal-shadow hover:translate-y-0.5 transition-transform"
        >
          Create New Roadmap
        </button>
      </section>
    </div>
    </UnderDevelopmentOverlay>
  );
}
