<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use App\Models\CasoGeneral;

class CasoGeneralRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Puedes agregar lógica de autorización aquí
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        $rules = CasoGeneral::rules();
        
        // Agregar reglas específicas para archivos
        $rules['firma_aprendiz'] = 'nullable|image|mimes:jpeg,png,jpg|max:2048';
        $rules['archivos.*'] = 'nullable|file|mimes:pdf,jpeg,png,jpg|max:5120'; // 5MB para archivos generales
        
        return $rules;
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        $messages = CasoGeneral::messages();
        
        // Agregar mensajes específicos para archivos
        $messages['firma_aprendiz.image'] = 'El archivo debe ser una imagen.';
        $messages['firma_aprendiz.mimes'] = 'La imagen debe ser de tipo: jpeg, png, jpg.';
        $messages['firma_aprendiz.max'] = 'La imagen no debe exceder 2MB.';
        $messages['archivos.*.file'] = 'El archivo debe ser válido.';
        $messages['archivos.*.mimes'] = 'El archivo debe ser de tipo: pdf, jpeg, png, jpg.';
        $messages['archivos.*.max'] = 'El archivo no debe exceder 5MB.';
        
        return $messages;
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'fecha' => 'fecha',
            'nombre_aprendiz' => 'nombre del aprendiz',
            'tipo_documento' => 'tipo de documento',
            'numero_documento' => 'número de documento',
            'numero_ficha' => 'número de ficha',
            'motivo' => 'motivo',
            'responsable' => 'responsable',
            'firma_aprendiz' => 'firma del aprendiz',
            'archivos' => 'archivos adjuntos',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Limpiar y formatear datos antes de la validación
        $this->merge([
            'nombre_aprendiz' => trim($this->nombre_aprendiz),
            'numero_documento' => trim($this->numero_documento),
            'numero_ficha' => trim($this->numero_ficha),
            'responsable' => trim($this->responsable),
            'motivo' => trim($this->motivo),
        ]);
    }
} 