import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";

interface PortionConfirmDialogProps {
  open: boolean;
  onConfirm: (portionMultiplier: number) => void;
  onReanalyze: () => void;
  onClose: () => void;
  totalCalories: number;
}

export function PortionConfirmDialog({
  open,
  onConfirm,
  onReanalyze,
  onClose,
  totalCalories
}: PortionConfirmDialogProps) {
  const [portionSize, setPortionSize] = useState<number>(1);

  const handleConfirm = () => {
    onConfirm(portionSize);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>تأكيد حجم الحصة / Confirm Portion Size</DialogTitle>
          <DialogDescription>
            {totalCalories > 3500 ? (
              <>
                <span className="block text-destructive font-semibold mb-2">
                  ⚠️ هذا يبدو وكأنه طبق كبير مشترك
                </span>
                <span className="block text-sm">
                  This looks like a large shared platter. Please adjust the portion size or confirm if this is for one person.
                </span>
              </>
            ) : (
              <span>
                يرجى تأكيد حجم الحصة أو ضبطها / Please confirm or adjust the portion size
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">حجم الحصة / Portion Size</span>
              <span className="text-sm text-muted-foreground">{Math.round(portionSize * 100)}%</span>
            </div>
            <Slider
              value={[portionSize]}
              onValueChange={(values) => setPortionSize(values[0])}
              min={0.25}
              max={2}
              step={0.25}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>ربع / Quarter (25%)</span>
              <span>نصف / Half (50%)</span>
              <span>كامل / Full (100%)</span>
              <span>ضعف / Double (200%)</span>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2">
            <Button
              variant={portionSize === 0.5 ? "default" : "outline"}
              size="sm"
              onClick={() => setPortionSize(0.5)}
            >
              نصف / Half
            </Button>
            <Button
              variant={portionSize === 0.75 ? "default" : "outline"}
              size="sm"
              onClick={() => setPortionSize(0.75)}
            >
              75%
            </Button>
            <Button
              variant={portionSize === 1 ? "default" : "outline"}
              size="sm"
              onClick={() => setPortionSize(1)}
            >
              كامل / Full
            </Button>
            <Button
              variant={portionSize === 1.5 ? "default" : "outline"}
              size="sm"
              onClick={() => setPortionSize(1.5)}
            >
              كبير / Large
            </Button>
          </div>

          <div className="bg-muted p-3 rounded-lg">
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span>السعرات الأصلية / Original Calories:</span>
                <span className="font-medium">{Math.round(totalCalories)} kcal</span>
              </div>
              <div className="flex justify-between text-primary">
                <span>السعرات المعدلة / Adjusted Calories:</span>
                <span className="font-bold">{Math.round(totalCalories * portionSize)} kcal</span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onReanalyze} className="w-full sm:w-auto">
            إعادة التحليل / Re-analyze
          </Button>
          <Button onClick={handleConfirm} className="w-full sm:w-auto">
            تأكيد / Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
