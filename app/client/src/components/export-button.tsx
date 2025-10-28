import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileText, FileSpreadsheet, File } from "lucide-react";
import { exportData, type ExportData, type ExportFormat } from "@/lib/export-utils";
import { useToast } from "@/hooks/use-toast";

interface ExportButtonProps {
  data: ExportData;
  disabled?: boolean;
  size?: "default" | "sm" | "lg" | "icon";
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost";
  className?: string;
}

export function ExportButton({ 
  data, 
  disabled = false,
  size = "default",
  variant = "outline",
  className = ""
}: ExportButtonProps) {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (format: ExportFormat) => {
    if (isExporting || disabled) return;
    
    setIsExporting(true);
    
    try {
      exportData(data, format);
      
      toast({
        title: "Export Successful",
        description: `${data.title} exported as ${format.toUpperCase()}`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: `Failed to export ${format.toUpperCase()}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const getFormatIcon = (format: ExportFormat) => {
    switch (format) {
      case 'csv':
        return <FileText className="h-4 w-4" />;
      case 'xlsx':
        return <FileSpreadsheet className="h-4 w-4" />;
      case 'pdf':
        return <File className="h-4 w-4" />;
      default:
        return <Download className="h-4 w-4" />;
    }
  };

  const formats: { format: ExportFormat; label: string; description: string }[] = [
    { format: 'csv', label: 'CSV', description: 'Comma-separated values' },
    { format: 'xlsx', label: 'Excel', description: 'Microsoft Excel format' },
    { format: 'pdf', label: 'PDF', description: 'Portable document format' },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant={variant} 
          size={size}
          disabled={disabled || isExporting}
          className={`gap-2 ${className}`}
          data-testid="button-export"
        >
          <Download className="h-4 w-4" />
          {size !== "icon" && (isExporting ? "Exporting..." : "Export")}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {formats.map(({ format, label, description }) => (
          <DropdownMenuItem
            key={format}
            onClick={() => handleExport(format)}
            disabled={isExporting}
            className="gap-2"
            data-testid={`export-${format}`}
          >
            {getFormatIcon(format)}
            <div className="flex flex-col">
              <span className="font-medium">{label}</span>
              <span className="text-xs text-muted-foreground">{description}</span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}