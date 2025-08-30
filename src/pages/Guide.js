export default function Home({ CoursesComponent }) {
  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: "16px" }}>
      <h1 style={{ margin: "8px 0" }}>Welcome back 👋</h1>
      {/* Render your existing Courses list component right here */}
      {CoursesComponent}
    </main>
  );
}
