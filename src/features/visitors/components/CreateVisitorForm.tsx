import { useFormContext, Controller } from "react-hook-form"
import { ErrorMessage } from "@/shared/components/ErrorMessage"
import { useQuery } from "@tanstack/react-query"
import Select from "react-select"

import { toUpper } from "@/shared/helpers/textTransformUppercase"
import type { CreateVisitorFormData } from "@/features/visitors/schema/Types"
import { getCompanyForSelectAPI } from "@/features/company/api/companyAPI"
import { searchableSelectStyles, getSelectClassNames } from "@/shared/components/ui/searchableSelectStyles"
import UploadImages from "@/shared/components/uploadImages/UploadImages"
import { useState } from "react"

type UploadFormProps = {
    showPhotoFields?: boolean;
    initialDpiFrontImage?: string;
    initialDpiBackImage?: string;
    initialLicenseImage?: string;
};

type PhotoType = "dpi_front" | "dpi_back" | "license" | null;

export default function CreateVisitorForm({ showPhotoFields = true, initialDpiFrontImage, initialDpiBackImage, initialLicenseImage }: UploadFormProps) {
    const { register, setValue, control, formState: { errors } } = useFormContext<CreateVisitorFormData>();

    const [photoType, setPhotoType] = useState<PhotoType>(null);
    const [openCamera, setOpenCamera] = useState(false);

    const [dpiFrontImage, setDpiFrontImage] = useState<string | null>(initialDpiFrontImage ?? null);
    const [dpiBackImage, setDpiBackImage] = useState<string | null>(initialDpiBackImage ?? null);
    const [licenseImage, setLicenseImage] = useState<string | null>(initialLicenseImage ?? null);

    const { data: companies } = useQuery({
        queryKey: ["company-select"],
        queryFn: getCompanyForSelectAPI,
    });

    const companyOptions = companies?.map((company) => ({
        value: company.id,
        label: `${company.name}`,
    })) ?? [];

    const handleOpenCamera = (type: PhotoType) => {
        setPhotoType(type);
        setOpenCamera(true);
    };

    const handleSavePhoto = (imgBase64: string) => {
        if (photoType === "dpi_front") {
            setDpiFrontImage(imgBase64);
            setValue("document_photo_front", imgBase64, { shouldValidate: true });
        }
        if (photoType === "dpi_back") {
            setDpiBackImage(imgBase64);
            setValue("document_photo_back", imgBase64, { shouldValidate: true });
        }
        if (photoType === "license") {
            setLicenseImage(imgBase64);
            setValue("license_photo", imgBase64, { shouldValidate: true });
        }
        setOpenCamera(false);
        setPhotoType(null);
    };

    return (
        <div className="form-container">

            <div className="form-group">
                <label htmlFor="name" className="form-label">
                    Nombre de la persona visitante
                    <span className="required">*</span>
                </label>
                <div className="input-icon-wrapper">
                    <input
                        id="name"
                        type="text"
                        placeholder="NM Solution"
                        className={`form-input ${errors.name ? "form-input-error" : "form-input-normal"}`}
                        {...register("name", {
                            setValueAs: toUpper,
                            required: "El nombre del visitante es obligatorio",
                        })}
                    />
                </div>
                {errors.name && (
                    <ErrorMessage>{errors.name.message}</ErrorMessage>
                )}
            </div>

            <div className="form-group">
                <label className="form-label">
                    Empresa <span className="required">*</span>
                </label>
                <Controller
                    name="company_id"
                    control={control}
                    rules={{ required: "El nombre de la empresa es obligatorio" }}
                    render={({ field }) => (
                        <Select<{ value: number; label: string }>
                            {...field}
                            options={companyOptions}
                            placeholder="Escribe para buscar empresas..."
                            isClearable
                            isSearchable
                            noOptionsMessage={() => "No se encontraron empresas"}
                            value={companyOptions.find((option) => option.value === field.value) || null}
                            onChange={(selected) => field.onChange(selected?.value ?? null)}
                            classNames={getSelectClassNames(!!errors.company_id)}
                            styles={searchableSelectStyles}
                        />
                    )}
                />
                {errors.company_id && (
                    <ErrorMessage>{errors.company_id.message}</ErrorMessage>
                )}
            </div>

            <div className="form-group">
                <label htmlFor="document_number" className="form-label">
                    Número de DPI
                    <span className="required">*</span>
                </label>
                <div className="input-icon-wrapper">
                    <input
                        id="document_number"
                        type="number"
                        placeholder="2859942561245"
                        className={`form-input ${errors.document_number ? "form-input-error" : "form-input-normal"}`}
                        {...register("document_number", {
                            required: "El número de DPI es obligatorio",
                        })}
                    />
                </div>
                {errors.document_number && (
                    <ErrorMessage>{errors.document_number.message}</ErrorMessage>
                )}
            </div>

            <div className="form-group">
                <label htmlFor="license_number" className="form-label">
                    Licencia
                </label>
                <div className="input-icon-wrapper">
                    <input
                        id="license_number"
                        type="text"
                        placeholder="2545124512414"
                        className={`form-input ${errors.license_number ? "form-input-error" : "form-input-normal"}`}
                        {...register("license_number")}
                    />
                </div>
                {errors.license_number && (
                    <ErrorMessage>{errors.license_number.message}</ErrorMessage>
                )}
            </div>

            {showPhotoFields && (
                <>
                    {/* DPI Frontal */}
                    <div className="form-group">
                        <label className="form-label font-bold">
                            Fotografía DPI — Frontal
                            <span className="text-sm text-gray-500 font-normal ml-1">(requerida)</span>
                        </label>
                        {dpiFrontImage ? (
                            <img src={dpiFrontImage} className="h-40 w-40 rounded-lg border mb-2 shadow" alt="DPI frontal" />
                        ) : (
                            <div className="h-40 w-40 border rounded-lg flex items-center justify-center text-gray-400 mb-2">
                                Sin foto
                            </div>
                        )}
                        <button
                            type="button"
                            className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg"
                            onClick={() => handleOpenCamera("dpi_front")}
                        >
                            Tomar foto frontal DPI
                        </button>
                        <input type="hidden" {...register("document_photo_front")} />
                    </div>

                    {/* DPI Posterior */}
                    <div className="form-group">
                        <label className="form-label font-bold">
                            Fotografía DPI — Posterior
                        </label>
                        {dpiBackImage ? (
                            <img src={dpiBackImage} className="h-40 w-40 rounded-lg border mb-2 shadow" alt="DPI posterior" />
                        ) : (
                            <div className="h-40 w-40 border rounded-lg flex items-center justify-center text-gray-400 mb-2">
                                Sin foto
                            </div>
                        )}
                        <button
                            type="button"
                            className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-lg"
                            onClick={() => handleOpenCamera("dpi_back")}
                        >
                            Tomar foto posterior DPI
                        </button>
                        <input type="hidden" {...register("document_photo_back")} />
                    </div>

                    {/* Licencia */}
                    <div className="form-group mt-6">
                        <label className="form-label font-bold">
                            Fotografía Licencia
                        </label>
                        {licenseImage ? (
                            <img src={licenseImage} className="h-40 w-40 rounded-lg border mb-2 shadow" alt="Licencia" />
                        ) : (
                            <div className="h-40 w-40 border rounded-lg flex items-center justify-center text-gray-400 mb-2">
                                Sin foto
                            </div>
                        )}
                        <button
                            type="button"
                            className="mt-2 bg-green-600 text-white px-4 py-2 rounded-lg"
                            onClick={() => handleOpenCamera("license")}
                        >
                            Tomar foto Licencia
                        </button>
                        <input type="hidden" {...register("license_photo")} />
                        {errors.license_photo && (
                            <ErrorMessage>{errors.license_photo.message}</ErrorMessage>
                        )}
                    </div>
                </>
            )}

            {openCamera && (
                <UploadImages
                    onClose={() => setOpenCamera(false)}
                    onSave={handleSavePhoto}
                />
            )}

        </div>
    );
}
