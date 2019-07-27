ENV=d

# git bash on windows: set USER from USERNAME
if [ -z "${USER:-}" ]; then
    USER="${USERNAME,,}"
fi

POSTGRES_USER="postgres"
POSTGRES_PASSWORD="postgres"
POSTGRES_DB="tlm"
POSTGRES_PORT=5432
POSTGRES_CONTAINER="$ENV-$USER-psql-tlm"
POSTGRES_IMAGE="postgres"

NODE_VERSION="10.16.0"
