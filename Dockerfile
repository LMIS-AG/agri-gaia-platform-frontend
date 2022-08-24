FROM httpd:2.4
LABEL maintainer = "Andre Schnitker <Andre.Schnitker@lmis.de>"
ENV STI_SCRIPTS_PATH=/usr/libexec/s2i \
    SOURCE_DIR=/opt/application

LABEL io.k8s.description="Builder image for the agrigaia UI application" \
      io.k8s.display-name="ag-platform-ui-frontend-builder" \
      io.openshift.s2i.scripts-url=image://${STI_SCRIPTS_PATH}

RUN adduser --disabled-login -u 1001 test && apt update && apt install -y curl

RUN curl -fsSL https://deb.nodesource.com/setup_lts.x | bash - \
    && apt-get install -y nodejs && npm install -g @angular/cli@latest
RUN mkdir -p /usr/lib/node_modules && chown -R 1001 /usr/lib/node_modules
COPY ./s2i/bin/ ${STI_SCRIPTS_PATH}

RUN mkdir -p $SOURCE_DIR \
      && chmod 0777 $SOURCE_DIR \
      && chmod -R 0777 /usr/local/apache2/htdocs && chown -R 1001:www-data /usr/local/apache2/htdocs \
      && chmod 755 ${STI_SCRIPTS_PATH}/* \
      && chmod 755 /tmp/ && chown -R 1001 /tmp/

RUN sed -i 's/Listen 80/Listen 8080/g' /usr/local/apache2/conf/httpd.conf \
    && sed -i '$aFallbackResource /index.html' /usr/local/apache2/conf/httpd.conf \
    && chown -R 1001:root /usr/local/apache2 && chown -R 1001:www-data /usr/local/apache2 \
    && chmod 775 -R /usr/local/apache2

# Drop root (as is tradition)
USER 1001
EXPOSE 8080
CMD ["/usr/libexec/s2i/usage"]
