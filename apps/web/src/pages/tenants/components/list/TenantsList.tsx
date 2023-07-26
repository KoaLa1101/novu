import { Container } from '@mantine/core';

import { Table } from '../../../../design-system';
import PageContainer from '../../../../components/layout/components/PageContainer';
import { When } from '../../../../components/utils/When';
import { columns } from './columns';
import { useTenants } from '../../../../hooks/useTenants';
import { Toolbar } from './ToolBar';
import { TenantsListNoData } from './TenantsListNoData';

export const TenantsList = ({ onAddTenantClick }: { onAddTenantClick: React.MouseEventHandler<HTMLButtonElement> }) => {
  const { tenants, loading } = useTenants();
  const hasTenants = tenants && tenants?.length > 0;
  const loadingPhase = hasTenants || loading;
  const noTenants = !hasTenants && !loading;

  return (
    <PageContainer
      style={{
        position: 'relative',
        overflow: 'hidden',
      }}
      title="Tenants"
    >
      <Container fluid sx={{ padding: '0 30px 8px 30px' }}>
        <Toolbar onAddTenantClick={onAddTenantClick} tenantLoading={loading} />
      </Container>
      <When truthy={loadingPhase}>
        <Table loading={loading} data-test-id="tenants-list-table" columns={columns} data={tenants || []} />
      </When>
      <When truthy={noTenants}>
        <TenantsListNoData />
      </When>
    </PageContainer>
  );
};
