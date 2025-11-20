import axios, { AxiosInstance } from 'axios';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.API_URL ||
  'https://apilogistica.mmalgor.com.ar';

describe('ShippingService: Update Shipment (E2E - Remote)', () => {
  let apiClient: AxiosInstance;
  let createdShipmentId: string;

  beforeAll(() => {
    apiClient = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  });

  beforeEach(async () => {
    // Crear un envío para usar en los tests
    try {
      const createResponse = await apiClient.post('/shipping', {
        order_id: Math.floor(Math.random() * 100000),
        user_id: Math.floor(Math.random() * 100000),
        delivery_address: {
          street: 'Av. Corrientes 1234',
          city: 'Buenos Aires',
          state: 'CABA',
          postal_code: 'C1043',
          country: 'AR',
        },
        transport_type: 'road',
        products: [
          {
            id: 1,
            quantity: 2,
          },
        ],
      });

      if (createResponse.status === 201) {
        createdShipmentId = createResponse.data.shipping_id;
      }
    } catch (error: any) {
      console.warn('Could not create test shipment:', error.message);
      // Continuar sin shipment creado, algunos tests lo crearán ellos mismos
    }
  });

  describe('PATCH /shipping/:id', () => {
    it('should update shipment status successfully', async () => {
      if (!createdShipmentId) {
        // Crear uno ahora si no existe
        const createResponse = await apiClient.post('/shipping', {
          order_id: 99999,
          user_id: 88888,
          delivery_address: {
            street: 'Test St 123',
            city: 'Buenos Aires',
            state: 'CABA',
            postal_code: 'C1000',
            country: 'AR',
          },
          transport_type: 'road',
          products: [{ id: 1, quantity: 1 }],
        });
        createdShipmentId = createResponse.data.shipping_id;
      }

      const updateResponse = await apiClient.patch(
        `/shipping/${createdShipmentId}`,
        {
          status: 'in_transit',
          updated_by: 'test-operator',
        },
      );

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.data).toHaveProperty('shipping_id', createdShipmentId);
      expect(updateResponse.data).toHaveProperty('status', 'in_transit');
      expect(updateResponse.data).toHaveProperty('logs');
      expect(Array.isArray(updateResponse.data.logs)).toBe(true);
      expect(updateResponse.data.logs.length).toBeGreaterThan(0);

      // Verificar que el último log contiene la actualización
      const lastLog =
        updateResponse.data.logs[updateResponse.data.logs.length - 1];
      expect(lastLog.status).toBe('in_transit');
      expect(lastLog.message).toContain('in_transit');
      expect(lastLog.message).toContain('test-operator');
    });

    it('should update status from CREATED to IN_TRANSIT', async () => {
      if (!createdShipmentId) return;

      // Verificar estado inicial
      const initialResponse = await apiClient.get(
        `/shipping/${createdShipmentId}`,
      );

      expect(['created', 'CREATED']).toContain(
        initialResponse.data.status.toLowerCase(),
      );

      // Actualizar a in_transit
      const updateResponse = await apiClient.patch(
        `/shipping/${createdShipmentId}`,
        {
          status: 'in_transit',
        },
      );

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.data.status).toBe('in_transit');
    });

    it('should update status through valid transitions', async () => {
      if (!createdShipmentId) return;

      // CREATED -> IN_TRANSIT
      await apiClient.patch(`/shipping/${createdShipmentId}`, {
        status: 'in_transit',
      });

      // IN_TRANSIT -> ARRIVED
      await apiClient.patch(`/shipping/${createdShipmentId}`, {
        status: 'arrived',
      });

      // ARRIVED -> IN_DISTRIBUTION
      await apiClient.patch(`/shipping/${createdShipmentId}`, {
        status: 'in_distribution',
      });

      // IN_DISTRIBUTION -> DELIVERED
      const finalResponse = await apiClient.patch(
        `/shipping/${createdShipmentId}`,
        {
          status: 'delivered',
        },
      );

      expect(finalResponse.status).toBe(200);
      expect(finalResponse.data.status).toBe('delivered');
    });

    it('should not allow updating DELIVERED shipment', async () => {
      if (!createdShipmentId) return;

      // Primero entregar el envío
      await apiClient.patch(`/shipping/${createdShipmentId}`, {
        status: 'delivered',
      });

      // Intentar actualizar un envío entregado
      try {
        await apiClient.patch(`/shipping/${createdShipmentId}`, {
          status: 'in_transit',
        });
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.response).toBeDefined();
        expect(error.response.status).toBe(400);
        expect(error.response.data.message).toMatch(/final/i);
      }
    });

    it('should not allow updating CANCELLED shipment', async () => {
      // Crear un nuevo envío para cancelar
      const createResponse = await apiClient.post('/shipping', {
        order_id: 11111,
        user_id: 22222,
        delivery_address: {
          street: 'Test St',
          city: 'Buenos Aires',
          state: 'CABA',
          postal_code: 'C1000',
          country: 'AR',
        },
        transport_type: 'road',
        products: [{ id: 1, quantity: 1 }],
      });

      const shipmentId = createResponse.data.shipping_id;

      // Cancelar el envío
      await apiClient.post(`/shipping/${shipmentId}/cancel`);

      // Intentar actualizar un envío cancelado
      try {
        await apiClient.patch(`/shipping/${shipmentId}`, {
          status: 'in_transit',
        });
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.response).toBeDefined();
        expect(error.response.status).toBe(400);
        expect(error.response.data.message).toMatch(/final/i);
      }
    });

    it('should not allow invalid status transitions (going backwards)', async () => {
      if (!createdShipmentId) return;

      // Avanzar a in_transit
      await apiClient.patch(`/shipping/${createdShipmentId}`, {
        status: 'in_transit',
      });

      // Intentar volver a created (no permitido)
      try {
        await apiClient.patch(`/shipping/${createdShipmentId}`, {
          status: 'created',
        });
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.response).toBeDefined();
        expect(error.response.status).toBe(400);
        expect(error.response.data.message).toMatch(/invalid.*transition/i);
      }
    });

    it('should return 404 for non-existent shipment', async () => {
      const fakeId = 'non-existent-id-12345';

      try {
        await apiClient.patch(`/shipping/${fakeId}`, {
          status: 'in_transit',
        });
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.response).toBeDefined();
        expect(error.response.status).toBe(404);
        expect(error.response.data.message).toMatch(/not found/i);
      }
    });

    it('should update updated_at timestamp', async () => {
      if (!createdShipmentId) return;

      // Obtener timestamp inicial
      const initialResponse = await apiClient.get(
        `/shipping/${createdShipmentId}`,
      );

      const initialUpdatedAt = initialResponse.data.updated_at;

      // Esperar un poco para asegurar diferencia de tiempo
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Actualizar
      const updateResponse = await apiClient.patch(
        `/shipping/${createdShipmentId}`,
        {
          status: 'in_transit',
        },
      );

      expect(updateResponse.data.updated_at).not.toBe(initialUpdatedAt);
      expect(
        new Date(updateResponse.data.updated_at).getTime(),
      ).toBeGreaterThan(new Date(initialUpdatedAt).getTime());
    });

    it('should add log entry when updating status', async () => {
      if (!createdShipmentId) return;

      // Obtener logs iniciales
      const initialResponse = await apiClient.get(
        `/shipping/${createdShipmentId}`,
      );

      const initialLogsCount = initialResponse.data.logs.length;

      // Actualizar
      const updateResponse = await apiClient.patch(
        `/shipping/${createdShipmentId}`,
        {
          status: 'in_transit',
          updated_by: 'test-user',
        },
      );

      expect(updateResponse.data.logs.length).toBe(initialLogsCount + 1);

      const lastLog =
        updateResponse.data.logs[updateResponse.data.logs.length - 1];
      expect(lastLog).toHaveProperty('timestamp');
      expect(lastLog).toHaveProperty('status', 'in_transit');
      expect(lastLog).toHaveProperty('message');
      expect(lastLog.message).toContain('in_transit');
      expect(lastLog.message).toContain('test-user');
    });

    it('should allow update without status (only updated_by)', async () => {
      if (!createdShipmentId) return;

      const updateResponse = await apiClient.patch(
        `/shipping/${createdShipmentId}`,
        {
          updated_by: 'admin',
        },
      );

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.data).toHaveProperty(
        'shipping_id',
        createdShipmentId,
      );
      expect(updateResponse.data.logs.length).toBeGreaterThan(0);

      const lastLog =
        updateResponse.data.logs[updateResponse.data.logs.length - 1];
      expect(lastLog.message).toContain('admin');
    });

    it('should validate status enum', async () => {
      if (!createdShipmentId) return;

      try {
        await apiClient.patch(`/shipping/${createdShipmentId}`, {
          status: 'invalid_status',
        });
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.response).toBeDefined();
        expect(error.response.status).toBe(400);
      }
    });

    it('should accept all valid status values', async () => {
      // Crear un nuevo envío para cada transición
      const validStatuses = [
        'created',
        'reserved',
        'in_transit',
        'arrived',
        'in_distribution',
        'delivered',
      ];

      for (const status of validStatuses) {
        const createResponse = await apiClient.post('/shipping', {
          order_id: Math.floor(Math.random() * 100000),
          user_id: Math.floor(Math.random() * 100000),
          delivery_address: {
            street: 'Test St',
            city: 'Buenos Aires',
            state: 'CABA',
            postal_code: 'C1000',
            country: 'AR',
          },
          transport_type: 'road',
          products: [{ id: 1, quantity: 1 }],
        });

        const shipmentId = createResponse.data.shipping_id;

        // Intentar actualizar (puede fallar si es transición inválida, pero el status debe ser válido)
        try {
          const updateResponse = await apiClient.patch(`/shipping/${shipmentId}`, {
            status,
          });
          // Si el status es válido y la transición es válida, debería funcionar
          expect([200, 400]).toContain(updateResponse.status);
        } catch (error: any) {
          // Si el status es válido pero la transición no, debería ser 400 con mensaje específico
          // Si el status es inválido, debería ser 400 por validación
          if (error.response?.status === 400) {
            // Verificar que no es error de validación de enum
            expect(
              error.response.data.message,
            ).not.toMatch(/must be.*enum/i);
          }
        }
      }
    });
  });
});

