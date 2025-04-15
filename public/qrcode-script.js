document.addEventListener("DOMContentLoaded", () => {
  // Variáveis para armazenar o SVG original e o arquivo atual
  let originalSvgContent = null;
  let currentLogoFile = null;

  // Função auxiliar para obter elementos com tratamento de erro
  function getElement(id) {
    const element = document.getElementById(id);
    if (!element) {
      console.warn(`Elemento com ID '${id}' não encontrado`);
    }
    return element;
  }

  // Configuração inicial do QR Code
  const qrCode = new QRCodeStyling({
    width: 256,
    height: 256,
    data: "https://seulink.com", // Link padrão
    dotsOptions: {
      color: "#111111", // Cor inicial do QR
      type: "square",
    },
    backgroundOptions: {
      color: "#ffffff",
    },
    imageOptions: {
      crossOrigin: "anonymous",
      margin: 10,
    },
  });

  // Variável para armazenar o tamanho selecionado
  let selectedSize = 1024; // Tamanho padrão

  // Adiciona o QR Code gerado no div
  qrCode.append(document.getElementById("qrcode"));

  // Atualiza o link do QR Code
  document.getElementById("link").addEventListener("input", (e) => {
    qrCode.update({
      data: e.target.value || "https://seulink.com",
    });
  });

  // Atualiza a cor do QR Code
  document.getElementById("color").addEventListener("input", (e) => {
    qrCode.update({
      dotsOptions: {
        color: e.target.value,
      },
    });

    // Se houver um SVG original armazenado e o checkbox estiver marcado
    if (
      originalSvgContent &&
      getElement("color-svg") &&
      getElement("color-svg").checked
    ) {
      // Aplicar a nova cor ao SVG original
      const coloredSvg = applySvgColor(originalSvgContent, e.target.value);

      // Atualizar apenas a imagem do QR code, sem recarregar o arquivo
      if (coloredSvg) {
        qrCode.update({ image: coloredSvg });
      }
    }
  });

  // Atualiza a cor de fundo do QR Code
  document.getElementById("bg-color").addEventListener("input", (e) => {
    qrCode.update({
      backgroundOptions: { color: e.target.value },
    });
  });

  // Atualiza o tipo de QR Code
  document.getElementById("dot-type").addEventListener("change", (e) => {
    qrCode.update({
      dotsOptions: {
        type: e.target.value,
      },
    });
  });

  // Adiciona logo ao QR Code
  document.getElementById("logo").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      currentLogoFile = file;

      const reader = new FileReader();
      reader.onload = (e) => {
        // Verificar se é um arquivo SVG
        if (file.type === "image/svg+xml") {
          // Armazenar o conteúdo SVG original
          const svgDataUrl = e.target.result;
          const base64Content = svgDataUrl.split(",")[1];
          originalSvgContent = atob(base64Content);

          // Verificar se o checkbox de colorir SVG está marcado
          const colorSvgCheckbox = getElement("color-svg");
          if (colorSvgCheckbox && colorSvgCheckbox.checked) {
            // Modificar o SVG para usar a cor principal
            const mainColor = getElement("color")
              ? getElement("color").value
              : "#111111";
            const coloredSvg = applySvgColor(originalSvgContent, mainColor);
            // Atualizar o QR code com o SVG colorido
            if (coloredSvg) {
              qrCode.update({ image: coloredSvg });
            }
          } else {
            // Usar o SVG original sem colorir
            qrCode.update({ image: e.target.result });
          }
        } else {
          // Para outros tipos de imagem, usar normalmente
          originalSvgContent = null;
          qrCode.update({ image: e.target.result });
        }
      };
      reader.readAsDataURL(file);
    }
  });

  // Atualiza a cor do SVG quando o checkbox muda
  const colorSvgCheckbox = getElement("color-svg");
  if (colorSvgCheckbox) {
    colorSvgCheckbox.addEventListener("change", () => {
      const colorSvg = colorSvgCheckbox.checked;
      const mainColor = getElement("color")?.value || "#111111";

      // Se o checkbox estiver marcado, aplicar a cor ao SVG
      if (colorSvg && originalSvgContent) {
        const coloredSvg = applySvgColor(originalSvgContent, mainColor);
        if (coloredSvg) {
          qrCode.update({ image: coloredSvg });
        }
      } else {
        // Se não estiver marcado, usar o SVG original
        if (currentLogoFile) {
          const reader = new FileReader();
          reader.onload = (event) => {
            qrCode.update({ image: event.target.result });
          };
          reader.readAsDataURL(currentLogoFile);
        }
      }
    });
  }

  // Configurar os botões de tamanho
  document.getElementById("size-512").addEventListener("click", (e) => {
    e.preventDefault();
    selectedSize = 512;
    updateSelectedSizeButton();
  });

  document.getElementById("size-1024").addEventListener("click", (e) => {
    e.preventDefault();
    selectedSize = 1024;
    updateSelectedSizeButton();
  });

  document.getElementById("size-2560").addEventListener("click", (e) => {
    e.preventDefault();
    selectedSize = 2560;
    updateSelectedSizeButton();
  });

  // Função para atualizar a aparência do botão selecionado
  function updateSelectedSizeButton() {
    // Remover classe ativa de todos os botões
    document.querySelectorAll(".size-btn").forEach((btn) => {
      btn.classList.remove("active");
    });

    // Adicionar classe ativa ao botão selecionado
    document.getElementById(`size-${selectedSize}`).classList.add("active");
  }

  // Inicializar o botão de tamanho padrão como ativo
  updateSelectedSizeButton();

  // Função para download em PNG com tamanho personalizado
  document.getElementById("download-png").addEventListener("click", () => {
    // Criar um novo QR Code temporário com o tamanho selecionado
    const tempQR = new QRCodeStyling({
      ...qrCode._options,
      width: selectedSize,
      height: selectedSize,
    });

    // Obter os dados do QR Code temporário
    tempQR.getRawData("png").then((pngBlob) => {
      // Mostrar o tamanho do arquivo
      const fileSizeKB = (pngBlob.size / 1024).toFixed(2);
      const fileSizeMB = (pngBlob.size / (1024 * 1024)).toFixed(2);

      // Criar elemento para mostrar o tamanho (se não existir)
      let sizeInfo = document.getElementById("size-info");
      if (!sizeInfo) {
        sizeInfo = document.createElement("div");
        sizeInfo.id = "size-info";
        sizeInfo.className = "size-info";
        document
          .querySelector(".buttons")
          .insertAdjacentElement("beforebegin", sizeInfo);
      }

      // Atualizar informação de tamanho
      sizeInfo.innerHTML = `
        <p>Tamanho do arquivo PNG: ${fileSizeKB} KB (${fileSizeMB} MB)</p>
        <p>Dimensões: ${selectedSize} x ${selectedSize} pixels</p>
      `;

      // Criar URL do blob e iniciar download
      const url = URL.createObjectURL(pngBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "qr-code.png";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  });

  // Função para download em SVG com tamanho personalizado
  document.getElementById("download-svg").addEventListener("click", () => {
    // Criar um novo QR Code temporário com o tamanho selecionado
    const tempQR = new QRCodeStyling({
      ...qrCode._options,
      width: selectedSize,
      height: selectedSize,
    });

    // Obter os dados do QR Code temporário
    tempQR.getRawData("svg").then((svgBlob) => {
      const reader = new FileReader();
      reader.onload = function (e) {
        let svgString = e.target.result;

        // Se houver um logo, garantir que ele esteja incorporado no SVG
        if (qrCode._options.image && currentLogoFile && originalSvgContent) {
          // Se o logo for SVG, incorporar diretamente o código SVG
          if (currentLogoFile.type === "image/svg+xml") {
            // Extrair informações da imagem existente para posicionamento
            const imageMatch = svgString.match(/<image[^>]*>/);
            if (imageMatch) {
              const imageTag = imageMatch[0];
              const xMatch = imageTag.match(/x="([^"]*)"/);
              const yMatch = imageTag.match(/y="([^"]*)"/);
              const widthMatch = imageTag.match(/width="([^"]*)"/);
              const heightMatch = imageTag.match(/height="([^"]*)"/);

              // Extrair valores de posição e tamanho
              const x = xMatch ? xMatch[1] : "0";
              const y = yMatch ? yMatch[1] : "0";
              const width = widthMatch ? widthMatch[1] : "0";
              const height = heightMatch ? heightMatch[1] : "0";

              // Criar um parser de DOM para manipular o SVG do logo
              const parser = new DOMParser();
              const logoSvgDoc = parser.parseFromString(
                originalSvgContent,
                "image/svg+xml"
              );

              // Obter o elemento SVG raiz do logo
              const logoSvgRoot = logoSvgDoc.querySelector("svg");

              // Aplicar a cor principal se o checkbox estiver marcado
              if (getElement("color-svg") && getElement("color-svg").checked) {
                const mainColor = getElement("color")?.value || "#111111";
                const elements = logoSvgDoc.querySelectorAll(
                  "path, circle, rect, ellipse, line, polyline, polygon"
                );

                elements.forEach((el) => {
                  el.removeAttribute("fill");
                  el.removeAttribute("stroke");
                  el.setAttribute("fill", mainColor);
                });
              }

              // Extrair o conteúdo interno do SVG do logo (sem a tag svg externa)
              const logoContent = logoSvgRoot.innerHTML;

              // Criar um grupo SVG para o logo com posicionamento e escala corretos
              const logoGroup = `<g transform="translate(${x}, ${y})" width="${width}" height="${height}">
                <g transform="scale(${
                  parseFloat(width) /
                  parseFloat(
                    logoSvgRoot.getAttribute("viewBox").split(" ")[2] || 100
                  )
                })">
                  ${logoContent}
                </g>
              </g>`;

              // Remover a tag de imagem existente e substituir pelo grupo SVG do logo
              svgString = svgString.replace(/<image[^>]*\/>/, logoGroup);
            }

            // Finalizar o download com o SVG modificado
            downloadSvg(svgString);
          } else {
            // Para imagens não-SVG, usar a abordagem de data URL
            const logoReader = new FileReader();
            logoReader.onload = function (logoEvent) {
              const logoDataUrl = logoEvent.target.result;

              // Substituir o href da imagem existente pelo data URL do logo
              svgString = svgString.replace(
                /<image[^>]*href="[^"]*"/,
                `<image href="${logoDataUrl}"`
              );

              downloadSvg(svgString);
            };
            logoReader.readAsDataURL(currentLogoFile);
          }
        } else {
          // Se não houver logo, fazer o download normal
          downloadSvg(svgString);
        }
      };
      reader.readAsText(svgBlob);
    });

    // Função auxiliar para download do SVG
    function downloadSvg(svgContent) {
      // Criar blob do SVG modificado
      const svgBlob = new Blob([svgContent], { type: "image/svg+xml" });

      // Mostrar o tamanho do arquivo
      const fileSizeKB = (svgBlob.size / 1024).toFixed(2);
      const fileSizeMB = (svgBlob.size / (1024 * 1024)).toFixed(2);

      // Criar elemento para mostrar o tamanho (se não existir)
      let sizeInfo = document.getElementById("size-info");
      if (!sizeInfo) {
        sizeInfo = document.createElement("div");
        sizeInfo.id = "size-info";
        sizeInfo.className = "size-info";
        document
          .querySelector(".buttons")
          .insertAdjacentElement("beforebegin", sizeInfo);
      }

      // Atualizar informação de tamanho
      sizeInfo.innerHTML = `
        <p>Tamanho do arquivo SVG: ${fileSizeKB} KB (${fileSizeMB} MB)</p>
        <p>Dimensões: ${selectedSize} x ${selectedSize} pixels</p>
      `;

      // Criar URL do blob e iniciar download
      const url = URL.createObjectURL(svgBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "qr-code.svg";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  });

  // Função para aplicar cor ao SVG
  function applySvgColor(svgContent, color) {
    if (!svgContent) return null;

    try {
      // Criar um parser de DOM para manipular o SVG
      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(svgContent, "image/svg+xml");

      // Verificar se houve erro no parsing
      const parserError = svgDoc.querySelector("parsererror");
      if (parserError) {
        console.error("Erro ao analisar SVG:", parserError);
        return null;
      }

      // Selecionar todos os elementos dentro do SVG
      const elements = svgDoc.querySelectorAll(
        "path, circle, rect, ellipse, line, polyline, polygon"
      );

      // Aplicar a cor a todos os elementos
      elements.forEach((el) => {
        // Remover atributos de cor existentes
        el.removeAttribute("fill");
        el.removeAttribute("stroke");

        // Adicionar a nova cor como preenchimento
        el.setAttribute("fill", color);
      });

      // Converter o SVG modificado de volta para string
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(svgDoc);

      // Converter para data URL
      return "data:image/svg+xml;base64," + btoa(svgString);
    } catch (error) {
      console.error("Erro ao processar SVG:", error);
      return null;
    }
  }
});
