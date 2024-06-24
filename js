document.addEventListener("DOMContentLoaded", function() {
        document.getElementById("quotation-date").valueAsDate = new Date();
        const quotationItemsContainer = document.getElementById("quotation-items");
        const quotationTotal = document.getElementById("quotation-total");
        const printBtn = document.getElementById("print-btn");
        const pdf = document.getElementById("generate-pdf");
        const image = document.getElementById("generate-image");
        const container = document.querySelector(".container");
        let itemCount = 0;
        // Add item button event listener
        document.getElementById("add-item-btn").addEventListener("click", addItem);
        // Function to add item
        function addItem() {
          itemCount++;
          const itemTemplate = `
          <div class="quotation-item">
              <h2>${itemCount}</h2>
              <textarea type="text" rows="3" placeholder="商品名稱"></textarea>
              <label>商品圖片</label>
              <input type="file" accept="image/*">
              <img class="item-image" src="#" alt="Preview">
              <textarea type="text" placeholder="商品尺寸"></textarea>
              <br></br>
              <textarea type="text" placeholder="商品材質"></textarea>
              <input type="number" placeholder="單價" class="product-cost">
              <input type="number" placeholder="數量" class="quantity">
              <textarea type="text" placeholder="備註"></textarea>
              <br></br>
              <span id="subtotal" class="subtotal">小計: $0</span>
              <br></br>
              <button class="remove-item-btn">刪除</button>
          </div>
        `;
          quotationItemsContainer.insertAdjacentHTML("beforeend", itemTemplate);
          // Update item numbers
          const items = document.querySelectorAll(".quotation-item");
          items.forEach((item, index) => {
            const itemNumber = index + 1;
            item.querySelector("h2").textContent = itemNumber;
          });
          // Attach listeners
          setRemoveItemListeners();
          setFileInputListeners();
          setProductCostListeners();
        }
        // Function to set file input listeners
        function setFileInputListeners() {
          const fileInputs = document.querySelectorAll(
            '.quotation-item input[type="file"]'
          );
          fileInputs.forEach((input) => {
            input.addEventListener("change", function() {
              const img = this.parentElement.querySelector(".item-image");
              if (this.files && this.files[0]) {
                const reader = new FileReader();
                reader.onload = function(e) {
                  img.src = e.target.result;
                };
                reader.readAsDataURL(this.files[0]);
              }
            });
          });
        }
        // Function to set product cost listeners
        function setProductCostListeners() {
          const productCostInputs = document.querySelectorAll(
            ".quotation-item input.product-cost"
          );
          const quantityInputs = document.querySelectorAll(
            ".quotation-item input.quantity"
          );
          productCostInputs.forEach((input) => {
            input.addEventListener("input", updateItemSubtotal);
          });
          quantityInputs.forEach((input) => {
            input.addEventListener("input", updateItemSubtotal);
          });
        }
        // Function to set remove item listeners
        function setRemoveItemListeners() {
          const removeItemBtns = document.querySelectorAll(".remove-item-btn");
          removeItemBtns.forEach((btn) => {
            btn.addEventListener("click", () => {
              const itemToRemove = btn.parentElement;
              const items = document.querySelectorAll(".quotation-item");
              // Remove the item from the DOM
              itemToRemove.remove();
              // Update item numbers
              items.forEach((item, index) => {
                const itemNumber = index + 1;
                item.querySelector("h2").textContent = itemNumber;
              });
              // Update itemCount
              itemCount = items.length;
              // Update total
              updateTotal();
            });
          });
        }
        // Function to update item subtotal
        function updateItemSubtotal() {
          const item = this.parentElement;
          const productCost = item.querySelector(".product-cost").value;
          const quantity = item.querySelector(".quantity").value;
          const subtotal = productCost * quantity;
          item.querySelector(".subtotal").textContent = `小計: NTD${subtotal}`;
          updateTotal();
        }
        // Function to update total
        document.getElementById("display-tax-checkbox").addEventListener("change", updateTotal);
        document.getElementById("signature-checkbox").addEventListener("change", updateTotal);
        document.getElementById("deposit-checkbox").addEventListener("change", updateTotal);
        document.getElementById("already-paid-input").addEventListener("change", updateTotal);

        function updateTotal() {
          let subtotal = 0;
          let grandTotal = 0;
          const editableTotalInput = document.getElementById("editable-total");
          const newTotal = parseFloat(editableTotalInput.value);
          const taxLabelOnTotal = document.getElementById('total-amount-label');
          const vipLabel = document.getElementById('vip-label');
          const grandTotalLabel = document.getElementById('grand-total-label');
          const specialPriceRow = document.getElementById('special-price-row');
          // Update the text content of the labels
          const subtotals = document.querySelectorAll(".subtotal");
          subtotals.forEach((subtotalElem) => {
            subtotal +=
              parseFloat(subtotalElem.textContent.replace("小計: NTD", "")) || 0;
          });
          const vipCheckbox = document.getElementById("vip");
          const displayTaxCheckbox = document.getElementById("display-tax-checkbox");
          const displaySignatureBox = document.getElementById("signature-checkbox");
          const displayDepositMessage = document.getElementById("deposit-checkbox");
          const optionC = document.getElementById("option-c");
          let grandTotalBeforeDiscount = subtotal;
          let vipDiscount = 0;
          let grandTotalAfterDiscount = grandTotalBeforeDiscount;
          if (!isNaN(newTotal)) {
            // If a new total is entered manually
            specialPriceRow.style.display = "table-row";
            document.getElementById("special-price").textContent = `NTD ${newTotal.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
          } else {
            // If no new total is entered manually, hide the special price row
            specialPriceRow.style.display = "none";
          }
          if (!isNaN(subtotal)) {
            // Check if subtotal is a valid number
            // Apply VIP discount if VIP checkbox is checked
            if (vipCheckbox.checked) {
              vipDiscount = subtotal * 0.1; // 10% discount for VIP
              grandTotalAfterDiscount = grandTotalBeforeDiscount - vipDiscount;
            }
            // Calculate tax amount
            let calcTax = 0;
            calcTax = subtotal * 0.05; // Assuming tax rate is 5%
            if (vipCheckbox.checked && displayTaxCheckbox.checked) {
              // VIP excl tax
              taxLabelOnTotal.textContent = '訂購商品總額';
              vipLabel.textContent = '優惠總金額(9折)'
              grandTotalLabel.textContent = '總金額(含稅)'
              document.getElementById("excl-tax").style.display = "table-row";
              document.getElementById("grand-total-row").style.display = "table-row";
              document.getElementById("if-vip").style.display = "table-row";
              document.getElementById("if-vip-discount").textContent = `NTD ${(subtotal * 0.9).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
              document.getElementById("tax-amount").textContent = `NTD ${(subtotal * 0.9 * 0.05).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
              document.getElementById("grand-total").textContent = `NTD ${((subtotal * 0.9 * 0.05) + (subtotal * 0.9)).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
              document.getElementById("display-tax-amount").textContent = `稅另計: NT ${(subtotal * 0.9 * 0.05).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
              document.getElementById("display-grand-total").textContent = `總金額(含稅): NT ${((subtotal * 0.9 * 0.05) + (subtotal * 0.9)).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
              grandTotalAfterDiscount = (subtotal * 0.9 * 0.05) + (subtotal * 0.9);
            } else if (vipCheckbox.checked && !displayTaxCheckbox.checked) {
              // VIP incl tax
              taxLabelOnTotal.textContent = '訂購商品總額(含稅)';
              vipLabel.textContent = '優惠總金額(9折)'
              document.getElementById("excl-tax").style.display = "none";
              document.getElementById("grand-total-row").style.display = "none";
              document.getElementById("if-vip").style.display = "table-row";
              document.getElementById("if-vip-discount").textContent = `NTD ${(subtotal * 0.9).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
              document.getElementById("display-tax-amount").textContent = `稅另計: NT ${(subtotal * 0.9 * 0.05).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
              document.getElementById("display-grand-total").textContent = `總金額(含稅): NT ${((subtotal * 0.9 * 0.05) + (subtotal * 0.9)).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
            } else if (!vipCheckbox.checked && displayTaxCheckbox.checked) {
              // No VIP incl tax
              taxLabelOnTotal.textContent = '訂購商品總額';
              grandTotalLabel.textContent = '總金額(含稅)'
              document.getElementById("excl-tax").style.display = "table-row";
              document.getElementById("grand-total-row").style.display = "table-row";
              document.getElementById("if-vip").style.display = "none";
              document.getElementById("tax-amount").textContent = `NTD ${calcTax.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
              document.getElementById("grand-total").textContent = `NTD ${(calcTax + subtotal).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
              document.getElementById("display-tax-amount").textContent = `稅另計: NT ${(subtotal * 0.05).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
              document.getElementById("display-grand-total").textContent = `總金額(含稅): NT ${((subtotal * 0.05) + (subtotal)).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
              grandTotalAfterDiscount = (subtotal * 0.05) + (subtotal);
            } else if (!vipCheckbox.checked && !displayTaxCheckbox.checked) {
              // No VIP excl tax
              taxLabelOnTotal.textContent = '訂購商品總額(含稅)';
              document.getElementById("excl-tax").style.display = "none";
              document.getElementById("grand-total-row").style.display = "none";
              document.getElementById("if-vip").style.display = "none";
              document.getElementById("tax-amount").textContent = ""; // Clear tax amount
              document.getElementById("grand-total").textContent = "";
              document.getElementById("display-tax-amount").textContent = `稅另計: NT ${(subtotal *  0.05).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
              document.getElementById("display-grand-total").textContent = `總金額(含稅): NT ${((subtotal * 0.05) + (subtotal)).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
            }
            if (displaySignatureBox.checked) {
              document.getElementById("signature").style.display = "table-row";
            } else {
              document.getElementById("signature").style.display = "none";
            }
            if (optionC.checked) {
              const paidAmount = (parseFloat(document.getElementById("already-paid-input").value));
              let outstandingBalance = 0;
              document.getElementById('already-paid-amount-row').style.display = "table-row";
              document.getElementById('to-pay-amount-row').style.display = "table-row";
              document.getElementById('already-paid-amount').textContent = `NTD ${paidAmount.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
              if (!isNaN(newTotal)) {
                // If a new total is entered manually
                outstandingBalance = newTotal - paidAmount;
                document.getElementById('to-pay-amount').textContent = `NTD ${outstandingBalance.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
              } else {
                // If no new total is entered manually, hide the special price row
                outstandingBalance = grandTotalAfterDiscount - paidAmount;
                document.getElementById('to-pay-amount').textContent = `NTD ${outstandingBalance.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
              }
            }
          }
          // Calculate 30% based on whether a special price is entered or not
          let thirtyPercent;
          if (!isNaN(newTotal)) {
            thirtyPercent = newTotal * 0.3; // Calculate 30% of the special price
          } else {
            thirtyPercent = grandTotalAfterDiscount * 0.3; // Calculate 30% of the grand total
          }
          // Update the notes with the calculated 30%
          const notesContainer = document.querySelector(".notes-container");
          if (thirtyPercent > 0 && displayDepositMessage.checked) {
            notesContainer.innerHTML = `<p>請支付訂金 <span style="color: red;">NTD ${thirtyPercent.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</span> (總金額的30%），以確定訂單成立並開始製作，製作時間將依商品不同而定，訂製完成並送達後方收取尾款。</p>`;
          } else {
            notesContainer.innerHTML = `<p></p>`;
          }
          // Update total amount, VIP discount, and grand total
          quotationTotal.textContent = `${grandTotalBeforeDiscount.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
          document.getElementById("vip-discount").textContent = `VIP 優惠: NT ${vipDiscount.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
          document.getElementById("grand-total-after-discount").textContent = `總金額: NT ${grandTotalAfterDiscount.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
        }
        // Even listener for special price
        document.getElementById("editable-total").addEventListener('input', updateTotal);
        // Event listener for VIP checkbox
        document.getElementById("vip").addEventListener("change", updateTotal);
        // Print button event listener
        printBtn.addEventListener("click", () => {
          populateQuotation();
          populateLeftHeader();
          window.print();
        });
        // Generate PDF button event listener
        pdf.addEventListener("click", () => {
          populateQuotation();
          populateLeftHeader();
          generatePDF();
        });
        // Generate PDF button event listener
        image.addEventListener("click", () => {
          populateQuotation();
          populateLeftHeader();
          generateImage();
        });
        // Function to populate quotation
        function populateQuotation() {
          const quotationTable = document.querySelector("#quotation-table tbody");
          const quotationItems = document.querySelectorAll(".quotation-item");
          quotationTable.innerHTML = "";
          quotationItems.forEach((item) => {
            // const productName = item.querySelector('input[type="text"]').value;
            const productName = item.querySelectorAll("textarea")[0].value;
            const productImage = item.querySelector(".item-image").src;
            // const productDimensions = item.querySelectorAll('input[type="text"]')[1].value;
            // const productMaterial = item.querySelectorAll('input[type="text"]')[2].value;
            const productDimensions = item.querySelectorAll("textarea")[1].value;
            const productMaterial = item.querySelectorAll("textarea")[2].value;
            const productCost = parseFloat(item.querySelector(".product-cost").value);
            const formattedProductCost = productCost.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            const quantity = item.querySelector(".quantity").value;
            const subtotal = parseFloat(productCost) * parseFloat(quantity);
            const remarks = item.querySelectorAll("textarea")[3].value;
            const newRow = document.createElement("tr");
            newRow.innerHTML = `
            <td>${productName}</td>
            <td><img src="${productImage}" alt="Product Image" style="max-width: 150px; height: auto;"></td>
            <td>${productDimensions}</td>
            <td>${productMaterial}</td>
            <td>${quantity}</td>
            <td>$${formattedProductCost}</td>
            <td>$${subtotal.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</td>
            <td>${remarks}</td>
        `;
            quotationTable.appendChild(newRow);
          });
          const totalAmount = document.getElementById("total-amount");
          totalAmount.textContent = `NTD ${quotationTotal.textContent.replace(
      "Grand Total: $",
      ""
    )}`;
          /* const totalAmount1 = parseFloat(
            document.getElementById("total-amount").textContent.replace(/,/g, "").replace("NTD ", "")
          );
          const vipDiscount1 =
            parseFloat(quotationTotal.textContent.replace(/[^0-9.]/g, "")) *
            0.1; // 10% discount for VIP
          const grandTotal = totalAmount1 - vipDiscount1;
          // Include VIP discount message
          const vipCheckbox = document.getElementById("vip");
          const vipDiscount =
            parseFloat(quotationTotal.textContent.replace(/[^0-9.]/g, "")) *
            0.1; // 10% discount for VIP
          const vipDiscountMessage = vipCheckbox.checked ?
            `NTD ${vipDiscount.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}` :
            "";
          const grandTotalMessage = vipCheckbox.checked ?
            `NTD ${grandTotal.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}` :
            "";
          container.querySelector(".vip-discount").textContent = vipDiscountMessage;
          //container.querySelector(".grand-total").textContent = grandTotalMessage; */
          container.style.display = "block";
        }
        // Function to populate left header
        function populateLeftHeader() {
          const invoiceid = document.getElementById("invoice-id").value;
          const invoiceType = document.querySelector(
            'input[name="invoice-type"]:checked'
          ).value;
          const name = document.getElementById("name").value;
          const address = document.getElementById("address").value;
          const contact = document.getElementById("contact").value;
          const quotationDate = document.getElementById("quotation-date").value;
          const leftHeader = document.querySelector(".left-header");
          let invoiceInfo = "";
          if (invoiceType === "二聯式發票") {
            invoiceInfo = invoiceType;
          } else {
            const vat = document.getElementById("vat").value;
            const invoice = document.getElementById("invoice").value;
            invoiceInfo = `<b>統一編號:</b> ${vat} | <b>發票抬頭:</b> ${invoice}`;
          }
          leftHeader.innerHTML = `
        <p style="font-weight:bold">單號: ${invoiceid} 日期: ${quotationDate}</p>
        <p><b>客戶名稱:</b> ${name} | <b>聯絡電話:</b> ${contact} | <b>送貨地址:</b> ${address} <br> <b>發票資訊:</b> ${invoiceInfo}</p>`;
        }
        // Save button event listener
        document.getElementById("save-btn").addEventListener("click", saveData);
        // Load button event listener
        document.getElementById("load-btn").addEventListener("change", loadData);
        // Function to save data
        // Function to save data
        function saveData() {
          const titleTextbox = document.getElementById("title-textbox").value;
          const customerName = document.getElementById("name").value;
          const quotationDate = document.getElementById("quotation-date").value;
          const invoiceId = document.getElementById("invoice-id").value;
          const optionValue = document.querySelector('input[name="option"]:checked')
            .value;
          const optionVAT = document.querySelector(
            'input[name="invoice-type"]:checked'
          ).value;
          const fileName = `${titleTextbox}_${optionValue}_${invoiceId}_${customerName}_${quotationDate}.json`;
          // Construct file name
          const customerDetails = {
            formType: optionValue,
            title: document.getElementById("title-textbox").value,
            invoiceid: document.getElementById("invoice-id").value,
            name: document.getElementById("name").value,
            address: document.getElementById("address").value,
            contact: document.getElementById("contact").value,
            vat: document.getElementById("vat").value,
            invoice: document.getElementById("invoice").value,
            vip: document.getElementById("vip").checked, // Include VIP status
            invoiceType: optionVAT,
            editableTotal: document.getElementById("editable-total").value,
            displayTax: document.getElementById("display-tax-checkbox").checked
          };
          const quotationItems = [];
          document.querySelectorAll(".quotation-item").forEach((item) => {
            const itemDetails = {
              productName: item.querySelectorAll("textarea")[0].value,
              productImage: item.querySelector(".item-image").src,
              productDimensions: item.querySelectorAll("textarea")[1].value,
              productMaterial: item.querySelectorAll("textarea")[2].value,
              productCost: item.querySelector(".product-cost").value,
              quantity: item.querySelector(".quantity").value,
              remarks: item.querySelectorAll("textarea")[3].value
            };
            quotationItems.push(itemDetails);
          });
          const data = {
            customerDetails: customerDetails,
            quotationItems: quotationItems
          };
          const jsonData = JSON.stringify(data);
          const blob = new Blob([jsonData], {
            type: "application/json"
          });
          // Open save dialog
          if (window.navigator.msSaveOrOpenBlob) {
            window.navigator.msSaveOrOpenBlob(blob, fileName);
          } else {
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }
        }
        // Function to load data
        function loadData(event) {
          itemCount = 0;
          const file = event.target.files[0];
          const reader = new FileReader();
          reader.onload = function(e) {
            const data = JSON.parse(e.target.result);
            const customerDetails = data.customerDetails;
            const quotationItems = data.quotationItems;
            // Populate customer details
            document.getElementById("title-textbox").value = customerDetails.title;
            document.getElementById("invoice-id").value = customerDetails.invoiceid;
            document.getElementById("name").value = customerDetails.name;
            document.getElementById("address").value = customerDetails.address;
            document.getElementById("contact").value = customerDetails.contact;
            document.getElementById("vat").value = customerDetails.vat;
            document.getElementById("invoice").value = customerDetails.invoice;
            document.getElementById("editable-total").value = customerDetails.editableTotal;
            // Check the VIP checkbox if the customer is marked as a VIP
            const vipCheckbox = document.getElementById("vip");
            vipCheckbox.checked = customerDetails.vip;
            // Check the displayTax checkbox if checkbox is checked
            const displayTaxCheckBox = document.getElementById("display-tax-checkbox");
            displayTaxCheckBox.checked = customerDetails.displayTax;
            // Clear existing items
            // Set the option type radio button based on loaded data
            const formType = customerDetails.formType;
            const optionRadios = document.querySelectorAll('input[name="option"]');
            optionRadios.forEach((radio) => {
              if (radio.value === formType) {
                radio.checked = true;
              } else {
                radio.checked = false;
              }
              radio.dispatchEvent(new Event("change"));
            });
            // Set the invoice type radio button based on loaded data
            const invoiceType = customerDetails.invoiceType;
            const invoiceTypeRadios = document.querySelectorAll(
              'input[name="invoice-type"]'
            );
            invoiceTypeRadios.forEach((radio) => {
              if (radio.value === invoiceType) {
                radio.checked = true;
              } else {
                radio.checked = false;
              }
            });
            // Enable or disable invoice details fields based on invoice type
            const invoiceDetailsFields = document.querySelectorAll("#vat, #invoice");
            if (invoiceType === "二聯式發票") {
              invoiceDetailsFields.forEach((field) => {
                field.disabled = true; // Disable fields
              });
            } else {
              invoiceDetailsFields.forEach((field) => {
                field.disabled = false; // Enable fields
              });
            }
            document.getElementById("quotation-items").innerHTML = "";
            // Populate quotation items
            quotationItems.forEach((item) => {
              addItemFromSavedData(item);
            });
            // Trigger input event for product cost and quantity fields to recalculate subtotals
            document.querySelectorAll(".product-cost, .quantity").forEach((input) => {
              input.dispatchEvent(new Event("input"));
            });
            // Update total after loading all items
            updateTotal();
            populateLeftHeader();
          };
          reader.readAsText(file);
        }
        // Function to add item from saved data
        function addItemFromSavedData(item) {
          addItem();
          const quotationItem = document.querySelector(".quotation-item:last-child");
          quotationItem.querySelectorAll("textarea")[0].value = item.productName;
          quotationItem.querySelector(".item-image").src = item.productImage;
          quotationItem.querySelectorAll("textarea")[1].value =
            item.productDimensions;
          quotationItem.querySelectorAll("textarea")[2].value = item.productMaterial;
          quotationItem.querySelector(".product-cost").value = item.productCost;
          quotationItem.querySelector(".quantity").value = item.quantity;
          quotationItem.querySelectorAll("textarea")[3].value = item.remarks;
        }
      });
      /*   function generatePDF() {
                      console.log("Generating PDF...");
                      const doc = new jsPDF('p', 'px', 'a4');
                      const container = document.querySelector(".container");
                      html2canvas(container, {
                        scale: 2
                      }).then(canvas => {
                        const imgData = canvas.toDataURL('image/png');
                        const pageWidth = doc.internal.pageSize.getWidth();
                        const pageHeight = doc.internal.pageSize.getHeight();
                        const widthRatio = pageWidth / canvas.width;
                        const heightRatio = pageHeight / canvas.height;
                        const ratio = widthRatio > heightRatio ? heightRatio : widthRatio;
                        const canvasWidth = canvas.width * ratio;
                        const canvasHeight = canvas.height * ratio;
                        const marginLeft = 20; // Set left margin
                        const marginRight = 20; // Set right margin
                        const marginTop = 20; // Set top margin
                        const availableWidth = pageWidth - marginLeft - marginRight;
                        const marginX = (availableWidth - canvasWidth) / 2 + marginLeft;
                        const marginY = marginTop; // Set the margin from the top of the page
                        doc.addImage(imgData, 'PNG', marginX + 20, marginY, canvasWidth - 40, canvasHeight);
                        doc.save('cabinet_size_calculator.pdf');
                      });
                    }*/
      function generatePDF() {
        console.log("Generating PDF...");
        const doc = new jsPDF("p", "px", "a4");
        const container = document.querySelector(".container");
        const customerName = document.getElementById("name").value;
        const quotationDate = document.getElementById("quotation-date").value;
        const fileName = `${customerName}_${quotationDate}.pdf`;
        //Generate QR code
        const qrCodeData = 'https://www.csts.com.tw'; // Replace with your data
        const qrCodeContainer = document.createElement('div');
        const qrCode = new QRCode(qrCodeContainer, {
          text: qrCodeData,
          width: 128,
          height: 128,
          correctLevel: QRCode.CorrectLevel.H
        });
        // Wait for the QR code image to load
        const qrCodeImage = document.getElementById("footer-image");
        if (qrCodeImage.complete) {
          captureAndGeneratePDF();
        } else {
          qrCodeImage.onload = captureAndGeneratePDF;
        }

        function captureAndGeneratePDF() {
          setTimeout(function() {
            const qrCodeImage = qrCodeContainer.querySelector('img').src;
            // Replace the footer image with the generated QR code
            document.getElementById('footer-image').src = qrCodeImage;
            html2canvas(container, {
              scale: 2.0
            }).then((canvas) => {
              const imgData = canvas.toDataURL("image/png");
              const pageWidth = doc.internal.pageSize.getWidth();
              const pageHeight = doc.internal.pageSize.getHeight();
              const widthRatio = pageWidth / canvas.width;
              const heightRatio = pageHeight / canvas.height;
              const ratio = widthRatio > heightRatio ? heightRatio : widthRatio;
              const canvasWidth = canvas.width * ratio;
              const canvasHeight = canvas.height * ratio;
              let marginX = (pageWidth - canvasWidth) / 2;
              let marginY = (pageHeight - canvasHeight) / 2;
              // Check if the canvas height exceeds the remaining space on the page
              if (marginY < 0) {
                doc.addPage(); // Add a new page
                marginY = 20; // Reset marginY for the new page
              }
              //doc.addImage(imgData, 'PNG', marginX + 20, marginY, canvasWidth - 40, canvasHeight);
              doc.addImage(imgData, "PNG", 20, 20, canvasWidth - 40, canvasHeight - 20);
              doc.save(fileName);
            });
          }, 500);
        }
      }

      function generateImage() {
        console.log("Generating Image...");
        // Capture HTML content as an image
        html2canvas(document.getElementById("container")).then((canvas) => {
          // Convert canvas to data URL
          const imgData = canvas.toDataURL("image/png");
          // Create a temporary link element
          const link = document.createElement("a");
          link.href = imgData;
          link.download = "cabinet_size_calculator.png";
          // Trigger the download
          link.click();
        });
      }

      function generateRandomInvoiceNumber() {
        // Generate a random number between 10000 and 99999
        return Math.floor(Math.random() * 90000) + 10000;
      }

      function displayInvoiceId() {
        // Get the current date
        var today = new Date();
        var dd = String(today.getDate()).padStart(2, "0");
        var mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
        var yyyy = today.getFullYear().toString().substr(-2); // Extract last 2 digits of the year
        var currentDate = mm + dd + yyyy;
        // Generate a random invoice number
        var invoiceNumber = currentDate + generateRandomInvoiceNumber();
        // Display the invoice number and date
        document.getElementById("invoice-id").value = invoiceNumber;
      }
      // Add event listener to title textbox
      document.getElementById("title-textbox").addEventListener("input", toggleInlineContainer);

      function toggleInlineContainer() {
        const checkedRadioButton = document.querySelector('input[name="option"]:checked');
        if (checkedRadioButton) {
          let title = "";
          const optionValue = checkedRadioButton.value;
          const inlineContainer = document.querySelector(".inline-container");
          const quotationTitle = document.getElementById("quotation-title");
          const notesContainer = document.querySelector(".notes-container");
          const titleTextbox = document.getElementById("title-textbox");
          // Get the value of the title textbox
          const titleValue = titleTextbox.value.trim();
          if (titleValue !== "") {
            title += titleValue + " "; // Add title textbox value followed by a space
          }
          if (optionValue === "報價單") {
            inlineContainer.style.display = "none"; // Hide the inline container for option A
            notesContainer.style.display = "none";
            title += "報價單 Quotation"; // Append 報價單 Quotation to the title
            quotationTitle.textContent = title; // Set text content to 報價單
          } else if (optionValue === "訂購單") {
            inlineContainer.style.display = "block"; // Show the inline container for option B
            notesContainer.style.display = "block";
            title += "訂購單 Purchase Order"; // Append 訂購單 Purchase Order to the title
            quotationTitle.textContent = title; // Set text content to 訂購單
          } else if (optionValue === "請款單") {
            inlineContainer.style.display = "block"; // Show the inline container for option B
            notesContainer.style.display = "block";
            title += "請款單 Invoice"; // Append 訂購單 Purchase Order to the title
            quotationTitle.textContent = title; // Set text content to 訂購單
          }
        }
      }
      // Add event listeners for option radio buttons
      document.querySelectorAll('input[name="option"]').forEach((radio) => {
        radio.addEventListener("change", toggleInlineContainer);
        radio.addEventListener("change", toggleInvoiceRadio);
      });
      document.querySelectorAll('input[name="invoice-type"]').forEach((radio) => {
        radio.addEventListener("change", handleInvoiceTypeChange);
      });
      // Function to handle invoice type change
      function handleInvoiceTypeChange() {
        const selectedOption = document.querySelector(
          'input[name="invoice-type"]:checked'
        ).value;
        const vatInput = document.getElementById("vat");
        const invoiceInput = document.getElementById("invoice");
        if (selectedOption === "二聯式發票") {
          vatInput.disabled = true;
          invoiceInput.disabled = true;
        } else {
          vatInput.disabled = false;
          invoiceInput.disabled = false;
        }
      }
      handleInvoiceTypeChange();
      toggleInlineContainer();
      document.querySelectorAll('input[name="payment-type"]').forEach((radio) => {
        radio.addEventListener("change", updatePaymentInfo);
      });

      function updatePaymentInfo() {
        const paymentInfo = document.getElementById("payment-info");
        const paymentType = document.querySelector(
          'input[name="payment-type"]:checked'
        ).value;
        if (paymentType === "cs") {
          paymentInfo.innerHTML = "銀行名稱：陽信商業銀行 蘭雅分行（銀行代碼 108）<br>收款人資料 ：誠舍傢飾有限公司，帳號：009420017191";
        } else if (paymentType === "ts") {
          paymentInfo.innerHTML = "銀行名稱：國泰世華銀行 天母分行（銀行代碼 013）<br>收款人資料 ：特舍傢飾有限公司，帳號：012030004432";
        } else {
          paymentInfo.innerHTML = "";
        }
      }

      function toggleInvoiceRadio() {
        var invoiceRadio = document.getElementById("already-paid-input");
        const depositCheckbox = document.getElementById("deposit-checkbox");
        var optionC = document.getElementById("option-c");
        if (optionC.checked) {
          invoiceRadio.style.display = "block";
          depositCheckbox.checked = false;
          depositCheckbox.disabled = true;
        } else {
          invoiceRadio.style.display = "none";
          depositCheckbox.disabled = false;
        }
      }
      const remarksTextarea = document.getElementById('remarksInput');
      // Get a reference to the paragraph where the text will be shown
      const remarksParagraph = document.getElementById('remarks');
      // Add an event listener to the textarea for the 'input' event
      remarksTextarea.addEventListener('input', function() {
        // Check if the textarea value is empty
        if (remarksTextarea.value.trim() === '') {
          // If it's empty, hide the paragraph
          remarksParagraph.style.display = 'none';
        } else {
          // If it's not empty, show the paragraph and set its text to the textarea value
          remarksParagraph.style.display = 'block';
          remarksParagraph.textContent = remarksTextarea.value;
          remarksParagraph.style.whiteSpace = 'pre-line';
        }
      });
