import React from 'react';
import { Construction, Clock, Wrench } from 'lucide-react';

interface UnderConstructionProps {
    title: string;
    description?: string;
}

export function UnderConstruction({ title, description }: UnderConstructionProps) {
    const glassStyle = {
        backdropFilter: 'blur(16px)',
        background: 'rgba(255, 255, 255, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 8px 32px rgba(31, 38, 135, 0.15)'
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6">
            <div className="max-w-2xl w-full">
                <div className="rounded-3xl p-12 text-center shadow-2xl" style={glassStyle}>
                    {/* Icono principal */}
                    <div className="w-24 h-24 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
                        <Construction className="w-12 h-12 text-white" />
                    </div>

                    {/* Título */}
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-4">
                        {title}
                    </h1>

                    {/* Descripción */}
                    <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                        {description || 'Esta sección está en desarrollo y estará disponible próximamente.'}
                    </p>

                    {/* Información adicional */}
                    <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-6 mb-8 border border-orange-200">
                        <div className="flex items-center justify-center gap-3 mb-4">
                            <Clock className="w-6 h-6 text-orange-600" />
                            <h3 className="text-lg font-semibold text-orange-800">En Construcción</h3>
                        </div>
                        <p className="text-orange-700">
                            Estamos trabajando duro para traerte esta funcionalidad.
                            Mientras tanto, puedes explorar otras secciones del sistema.
                        </p>
                    </div>

                    {/* Iconos decorativos */}
                    <div className="flex justify-center gap-6">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                            <Wrench className="w-6 h-6 text-white" />
                        </div>
                        <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
                            <Clock className="w-6 h-6 text-white" />
                        </div>
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                            <Construction className="w-6 h-6 text-white" />
                        </div>
                    </div>

                    {/* Mensaje de espera */}
                    <div className="mt-8 text-sm text-gray-500">
                        <p>Gracias por tu paciencia mientras desarrollamos esta funcionalidad.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
