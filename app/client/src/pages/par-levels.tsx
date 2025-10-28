import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, Target, TrendingUp, Brain, RefreshCw, CheckCircle } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ExportButton } from "@/components/export-button";
import { EXPORT_COLUMNS, prepareExportData, type ExportData } from "@/lib/export-utils";
import type { ParRecommendation, InventoryItem } from "@shared/schema";

interface ParRecommendationWithItem extends ParRecommendation {
  inventoryItem?: InventoryItem;
}

export default function ParLevels() {
  const { toast } = useToast();
  const [generatingRecommendations, setGeneratingRecommendations] = useState(false);

  // Fetch par recommendations
  const { data: recommendations = [], isLoading: loadingRecommendations, refetch: refetchRecommendations } = useQuery<ParRecommendationWithItem[]>({
    queryKey: ['/api/par-recommendations'],
    queryFn: async () => {
      const [recommendationsRes, inventoryRes] = await Promise.all([
        fetch('/api/par-recommendations'),
        fetch('/api/inventory')
      ]);
      
      const recommendations = await recommendationsRes.json();
      const inventory = await inventoryRes.json();
      
      // Enrich recommendations with inventory item data
      return recommendations.map((rec: ParRecommendation) => ({
        ...rec,
        inventoryItem: inventory.find((item: InventoryItem) => item.id === rec.inventoryItemId)
      }));
    }
  });

  // Generate MAPO recommendations
  const generateMAPOMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/par-recommendations/generate');
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "MAPO Recommendations Generated",
        description: `Successfully generated ${data.recommendations.length} intelligent par level recommendations.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/par-recommendations'] });
      setGeneratingRecommendations(false);
    },
    onError: (error) => {
      console.error('Error generating MAPO recommendations:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate MAPO recommendations. Please try again.",
        variant: "destructive",
      });
      setGeneratingRecommendations(false);
    },
  });

  const handleGenerateRecommendations = () => {
    setGeneratingRecommendations(true);
    generateMAPOMutation.mutate();
  };

  const getConfidenceColor = (confidence: string) => {
    const conf = parseFloat(confidence);
    if (conf >= 0.8) return "text-green-600";
    if (conf >= 0.6) return "text-blue-600";
    if (conf >= 0.4) return "text-yellow-600";
    return "text-red-600";
  };

  const getConfidenceBadge = (confidence: string) => {
    const conf = parseFloat(confidence);
    if (conf >= 0.8) return "excellent";
    if (conf >= 0.6) return "good";
    if (conf >= 0.4) return "moderate";
    return "low";
  };

  const formatRationale = (rationale: any) => {
    if (typeof rationale === 'string') return rationale;
    if (typeof rationale === 'object' && rationale) {
      return rationale.baseCalculation || 'MAPO algorithm analysis';
    }
    return 'Advanced par level calculation';
  };

  // Prepare export data for par recommendations
  const exportData: ExportData = {
    title: 'MAPO Par Level Recommendations',
    subtitle: 'Menu-Aware Par Optimization Results',
    filename: `par-recommendations-${new Date().toISOString().split('T')[0]}`,
    columns: EXPORT_COLUMNS.parRecommendations,
    data: prepareExportData(recommendations, (rec) => ({
      itemName: rec.inventoryItem?.name || 'Unknown Item',
      category: rec.inventoryItem?.category || 'General',
      currentStock: rec.inventoryItem?.currentStock || '0',
      recommendedPar: parseFloat(rec.recommendedPar).toFixed(1),
      safetyStock: parseFloat(rec.safetyStock).toFixed(1),
      confidence: `${Math.round(parseFloat(rec.confidence) * 100)}%`,
      rationale: formatRationale(rec.rationale),
      generatedDate: new Date(rec.createdAt).toLocaleDateString(),
    })),
  };

  return (
    <div className="space-y-6 p-6" data-testid="par-levels-page">
      {/* Header */}
      <div className="flex flex-col space-y-2">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
            <Brain className="h-4 w-4 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">MAPO Par Levels</h1>
            <p className="text-sm text-muted-foreground">Menu-Aware Par Optimization powered by AI</p>
          </div>
        </div>
      </div>

      {/* Generate Recommendations Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            Generate Smart Recommendations
          </CardTitle>
          <CardDescription>
            Generate intelligent par level recommendations using our patented MAPO algorithm that analyzes recipe usage, historical data, seasonality, and supplier lead times.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={handleGenerateRecommendations}
            disabled={generatingRecommendations || generateMAPOMutation.isPending}
            className="gap-2"
            data-testid="button-generate-mapo"
          >
            {generatingRecommendations || generateMAPOMutation.isPending ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Brain className="h-4 w-4" />
            )}
            Generate MAPO Recommendations
          </Button>
        </CardContent>
      </Card>

      {/* Recommendations List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-500" />
              Par Level Recommendations
            </div>
            <div className="flex items-center gap-2">
              <ExportButton 
                data={exportData}
                disabled={recommendations.length === 0}
                size="sm"
              />
              <Badge variant="secondary" data-testid="recommendations-count">
                {recommendations.length} items
              </Badge>
            </div>
          </CardTitle>
          <CardDescription>
            AI-generated par level recommendations with confidence scores and detailed rationale
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingRecommendations ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin" />
              <span className="ml-2 text-muted-foreground">Loading recommendations...</span>
            </div>
          ) : recommendations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Brain className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No par level recommendations available.</p>
              <p className="text-sm">Generate MAPO recommendations to get started.</p>
            </div>
          ) : (
            <ScrollArea className="h-[600px]">
              <div className="space-y-4">
                {recommendations.map((rec) => (
                  <Card key={rec.id} className="hover-elevate" data-testid={`recommendation-${rec.inventoryItem?.name}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-medium text-foreground">
                            {rec.inventoryItem?.name || 'Unknown Item'}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {(rec.inventoryItem?.category ?? 'General')} • {(rec.inventoryItem?.unit ?? 'units')}
                          </p>
                        </div>
                        <Badge variant="outline" className={getConfidenceColor(rec.confidence)}>
                          {Math.round(parseFloat(rec.confidence) * 100)}% confidence
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Current Stock</p>
                          <p className="text-lg font-medium text-foreground">
                            {(rec.inventoryItem?.currentStock ?? '0')} {(rec.inventoryItem?.unit ?? 'units')}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Recommended Par</p>
                          <p className="text-lg font-medium text-green-600">
                            {parseFloat(rec.recommendedPar).toFixed(1)} {(rec.inventoryItem?.unit ?? 'units')}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Safety Stock</p>
                          <p className="text-lg font-medium text-blue-600">
                            {parseFloat(rec.safetyStock).toFixed(1)} {(rec.inventoryItem?.unit ?? 'units')}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Recommendation Strength</span>
                          <span className="text-xs font-medium capitalize">{getConfidenceBadge(rec.confidence)}</span>
                        </div>
                        <Progress 
                          value={parseFloat(rec.confidence) * 100} 
                          className="h-2"
                        />
                      </div>

                      <Separator className="my-3" />

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">MAPO Analysis</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {formatRationale(rec.rationale)}
                        </p>
                        {typeof rec.rationale === 'object' && rec.rationale && 'factors' in rec.rationale && Array.isArray(rec.rationale.factors) && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {rec.rationale.factors.slice(0, 3).map((factor: string, index: number) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {factor}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex justify-between items-center mt-4">
                        <div className="text-xs text-muted-foreground">
                          Generated {new Date(rec.createdAt).toLocaleDateString()}
                        </div>
                        <Button variant="outline" size="sm" className="gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Apply Recommendation
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}