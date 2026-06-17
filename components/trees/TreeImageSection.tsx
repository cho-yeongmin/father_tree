import Image from "next/image";
import type { TreeImage } from "@/types/database";
import { Card } from "@/components/ui/Card";

interface TreeImageSectionProps {
  images: TreeImage[];
  treeName: string;
}

export function TreeImageSection({ images, treeName }: TreeImageSectionProps) {
  if (images.length === 0) {
    return null;
  }

  const [mainImage, ...restImages] = images;

  return (
    <Card padding="lg">
      <h3 className="text-2xl font-bold text-foreground">사진</h3>
      <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-border/20">
        <Image
          src={mainImage.url}
          alt={mainImage.description || `${treeName} 대표 사진`}
          width={1200}
          height={800}
          className="h-auto w-full object-cover"
          sizes="(max-width: 768px) 100vw, 720px"
          priority
        />
      </div>
      {mainImage.description && (
        <p className="mt-3 text-lg text-muted">{mainImage.description}</p>
      )}

      {restImages.length > 0 && (
        <ul className="mt-4 grid grid-cols-2 gap-3">
          {restImages.map((image, index) => (
            <li key={`${image.url}-${index}`} className="overflow-hidden rounded-xl border border-border">
              <Image
                src={image.url}
                alt={image.description || `${treeName} 사진 ${index + 2}`}
                width={600}
                height={400}
                className="h-36 w-full object-cover"
                sizes="(max-width: 768px) 45vw, 320px"
              />
              {image.description && (
                <p className="px-2 py-2 text-base text-muted line-clamp-2">
                  {image.description}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
