export default function PostSkeleton() {
  return (
    <div style={{
      padding: "16px",
      borderBottom: "1px solid #222"
    }}>
      <div style={{
        width: "80px",
        height: "10px",
        background: "#333",
        marginBottom: "10px",
        borderRadius: "4px"
      }} />

      <div style={{
        width: "60%",
        height: "14px",
        background: "#444",
        marginBottom: "10px",
        borderRadius: "4px"
      }} />

      <div style={{
        width: "100%",
        height: "200px",
        background: "#222",
        borderRadius: "10px"
      }} />
    </div>
  );
}