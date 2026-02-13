import { Button } from "@mui/material";

interface DownloadLinkProps {
  label: string;
  filename: string;
  exportFile: () => string | Promise<string>;
}

export default function DownloadLink({
  label,
  filename,
  exportFile,
}: DownloadLinkProps) {
  const handleClick = async () => {
    const text = await Promise.resolve(exportFile());
    const blob = new Blob([text], { type: "text/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Button
      variant="text"
      color="primary"
      onClick={handleClick}
      data-testid={`btn-download-${filename}`}
    >
      {label}
    </Button>
  );
}
