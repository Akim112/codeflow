FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080
RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 \
    && rm -rf /var/lib/apt/lists/*

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["CodeFlow.Api/CodeFlow.Api.csproj", "CodeFlow.Api/"]
COPY ["CodeFlow.sln", "."]
RUN dotnet restore "CodeFlow.Api/CodeFlow.Api.csproj"
COPY . .
WORKDIR "/src/CodeFlow.Api"
RUN dotnet build "CodeFlow.Api.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "CodeFlow.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "CodeFlow.Api.dll"]
