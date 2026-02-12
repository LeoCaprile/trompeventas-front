import { useState, useRef } from "react";
import { Form, useNavigation } from "react-router";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import {
  Loader2,
  Camera,
  User,
  Mail,
  Lock,
  Calendar,
  ShieldCheck,
  ShieldAlert,
  Check,
  MapPin,
} from "lucide-react";
import type { UserT } from "~/services/auth/auth.types";
import type { RegionT } from "~/services/locations/locations";

interface AvatarUpload {
  preview: string;
  publicUrl?: string;
  status: "uploading" | "done" | "error";
  error?: string;
}

interface ProfileFormProps {
  user: UserT;
  regions: RegionT[];
}

export function ProfileForm({ user, regions }: ProfileFormProps) {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [avatarUpload, setAvatarUpload] = useState<AvatarUpload | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string>(user.region ?? "");
  const selectedRegionData = regions.find((r) => r.region === selectedRegion);

  const avatarSrc = avatarUpload?.preview ?? user.image ?? undefined;
  const isUploading = avatarUpload?.status === "uploading";

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;

    const preview = URL.createObjectURL(file);
    setAvatarUpload({ preview, status: "uploading" });

    try {
      const presignRes = await fetch("/api/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
          folder: "avatars",
        }),
      });

      if (!presignRes.ok) {
        throw new Error("No se pudo obtener la URL de subida");
      }

      const { presignedUrl, publicUrl } = await presignRes.json();

      const uploadRes = await fetch(presignedUrl, {
        method: "PUT",
        body: file,
      });

      if (!uploadRes.ok) {
        throw new Error("Error al subir la imagen");
      }

      setAvatarUpload({ preview, publicUrl, status: "done" });
    } catch (err) {
      setAvatarUpload({
        preview,
        status: "error",
        error: err instanceof Error ? err.message : "Error al subir",
      });
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  const formattedDate = new Date(user.createdAt).toLocaleDateString("es-CL", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Form method="POST" className="space-y-6 sm:space-y-8">
      {/* Avatar section */}
      <div className="space-y-4 sm:space-y-5">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Camera className="h-4 w-4" />
          Foto de perfil
        </div>

        <div className="flex items-center gap-5">
          <div className="relative group">
            <Avatar className="h-20 w-20 sm:h-24 sm:w-24">
              <AvatarImage
                src={avatarSrc}
                alt={user.name}
                referrerPolicy="no-referrer"
              />
              <AvatarFallback className="text-2xl">
                <User className="h-8 w-8" />
              </AvatarFallback>
            </Avatar>

            {isUploading && (
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
                <Loader2 className="h-6 w-6 text-white animate-spin" />
              </div>
            )}

            {avatarUpload?.status === "done" && (
              <div className="absolute bottom-0 right-0">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500 ring-2 ring-background">
                  <Check className="h-3.5 w-3.5 text-white" />
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="absolute inset-0 flex items-center justify-center rounded-full bg-black/0 transition-colors hover:bg-black/40 cursor-pointer"
            >
              <Camera className="h-6 w-6 text-white opacity-0 transition-opacity group-hover:opacity-100" />
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium">Cambiar foto</p>
            <p className="text-xs text-muted-foreground">
              PNG, JPG o WebP
            </p>
            {avatarUpload?.status === "error" && (
              <p className="text-xs text-destructive">{avatarUpload.error}</p>
            )}
          </div>
        </div>
      </div>

      {avatarUpload?.status === "done" && avatarUpload.publicUrl && (
        <input type="hidden" name="imageUrl" value={avatarUpload.publicUrl} />
      )}

      <Separator />

      {/* Personal info section */}
      <div className="space-y-4 sm:space-y-5">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <User className="h-4 w-4" />
          Informacion personal
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">Nombre</Label>
          <Input
            id="name"
            name="name"
            required
            defaultValue={user.name}
            className="h-10 sm:h-11"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="email"
              value={user.email}
              disabled
              className="h-10 pl-10 sm:h-11"
            />
            <Lock className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </div>
          <p className="text-xs text-muted-foreground">
            El email no se puede cambiar.
          </p>
        </div>

        <div className="space-y-2">
          <Label>Miembro desde</Label>
          <div className="flex items-center gap-2 text-sm text-foreground">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            {formattedDate}
          </div>
        </div>
      </div>

      <Separator />

      {/* Location section */}
      <div className="space-y-4 sm:space-y-5">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <MapPin className="h-4 w-4" />
          Ubicacion
        </div>

        <div className="space-y-2">
          <Label htmlFor="region">Region</Label>
          <select
            id="region"
            name="region"
            defaultValue={user.region ?? ""}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:h-11"
          >
            <option value="">Seleccionar region</option>
            {regions.map((r) => (
              <option key={r.region} value={r.region}>
                {r.region}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="city">Ciudad</Label>
          <select
            id="city"
            name="city"
            defaultValue={user.city ?? ""}
            key={selectedRegion}
            disabled={!selectedRegion}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:h-11"
          >
            <option value="">Seleccionar ciudad</option>
            {selectedRegionData?.comunas.map((comuna) => (
              <option key={comuna} value={comuna}>
                {comuna}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Separator />

      {/* Account status section */}
      <div className="space-y-4 sm:space-y-5">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          {user.emailVerified ? (
            <ShieldCheck className="h-4 w-4" />
          ) : (
            <ShieldAlert className="h-4 w-4" />
          )}
          Estado de la cuenta
        </div>

        <div className="flex items-center gap-3">
          <Label>Email verificado</Label>
          {user.emailVerified ? (
            <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
              <ShieldCheck className="h-3 w-3 mr-1" />
              Verificado
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="border-yellow-300 bg-yellow-50 text-yellow-700"
            >
              <ShieldAlert className="h-3 w-3 mr-1" />
              No verificado
            </Badge>
          )}
        </div>
      </div>

      <Separator />

      {/* Submit */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
        <Button
          type="submit"
          size="lg"
          disabled={isSubmitting || isUploading}
          className="w-full sm:w-auto sm:min-w-[180px]"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            "Guardar cambios"
          )}
        </Button>
      </div>
    </Form>
  );
}
