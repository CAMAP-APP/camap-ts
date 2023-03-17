FROM codeurs/mod-neko
RUN sed -i 's!/var/www/html!/var/www/www!g' /etc/apache2/sites-available/000-default.conf
RUN service apache2 restart
RUN apt-get update
RUN apt-get -y install curl
RUN haxelib setup /usr/share/haxelib
RUN haxelib install templo
RUN cd /usr/bin && haxelib run templo
